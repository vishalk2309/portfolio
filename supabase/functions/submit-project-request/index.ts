// Supabase Edge Function: submit-project-request
//
// Verifies the emailed OTP, stores the project request, and emails YOU the
// details (plus a confirmation to the requester).
//
// Deploy:
//   supabase functions deploy submit-project-request --no-verify-jwt
//
// Secrets: BREVO_API_KEY, BREVO_SENDER_EMAIL, CONTACT_TO_EMAIL (fallback to
// sender), optional BREVO_SENDER_NAME / OWNER_NAME. SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });

const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

const MAX_FAILS = 5;
const LOCK_MINUTES = 30;

// deno-lint-ignore no-explicit-any
async function lockMinutesLeft(supabase: any, email: string): Promise<number> {
  const { data } = await supabase
    .from("otp_lockouts")
    .select("locked_until")
    .eq("email", email)
    .maybeSingle();
  if (!data?.locked_until) return 0;
  const leftMs = new Date(data.locked_until).getTime() - Date.now();
  return leftMs > 0 ? Math.ceil(leftMs / 60000) : 0;
}

// deno-lint-ignore no-explicit-any
async function registerFail(supabase: any, email: string): Promise<boolean> {
  const { data } = await supabase
    .from("otp_lockouts")
    .select("fail_count")
    .eq("email", email)
    .maybeSingle();
  const fails = (data?.fail_count || 0) + 1;
  const nowIso = new Date().toISOString();
  if (fails >= MAX_FAILS) {
    await supabase.from("otp_lockouts").upsert({
      email,
      fail_count: 0,
      locked_until: new Date(Date.now() + LOCK_MINUTES * 60000).toISOString(),
      updated_at: nowIso,
    });
    return true;
  }
  await supabase
    .from("otp_lockouts")
    .upsert({ email, fail_count: fails, locked_until: null, updated_at: nowIso });
  return false;
}

// deno-lint-ignore no-explicit-any
async function clearFails(supabase: any, email: string): Promise<void> {
  await supabase.from("otp_lockouts").upsert({
    email,
    fail_count: 0,
    locked_until: null,
    updated_at: new Date().toISOString(),
  });
}

function esc(s = ""): string {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

async function sendBrevo(payload: Record<string, unknown>, apiKey: string) {
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Brevo ${r.status}: ${await r.text()}`);
}

const row = (label: string, value: string) =>
  value ? `<p><b>${esc(label)}:</b><br>${esc(value).replace(/\n/g, "<br>")}</p>` : "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  let b: Record<string, string> & { botcheck?: unknown };
  try {
    b = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  // Honeypot — silently accept bots without doing anything.
  if (b.botcheck) return json({ success: true });

  const email = String(b.email || "").trim().toLowerCase();
  const code = String(b.code || "").trim();
  const name = String(b.name || "").trim();
  if (!name || !isEmail(email) || !code)
    return json({ success: false, error: "Missing required fields" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Blocked from too many wrong entries? Reject before checking anything.
  const locked = await lockMinutesLeft(supabase, email);
  if (locked > 0)
    return json(
      {
        success: false,
        error: `Too many failed attempts. Try again in ${locked} minute(s).`,
      },
      429
    );

  // Verify the latest live code for this email.
  const { data: otps } = await supabase
    .from("email_otps")
    .select("*")
    .eq("email", email)
    .eq("consumed", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  const otp = otps?.[0];
  if (!otp)
    return json({ success: false, error: "Code expired. Request a new one." }, 400);
  if (code !== otp.code) {
    await supabase
      .from("email_otps")
      .update({ attempts: otp.attempts + 1 })
      .eq("id", otp.id);
    const nowLocked = await registerFail(supabase, email);
    return json(
      {
        success: false,
        error: nowLocked
          ? `Too many failed attempts. Your email is locked for ${LOCK_MINUTES} minutes.`
          : "Incorrect code.",
      },
      nowLocked ? 429 : 400
    );
  }

  // Correct — clear failures, then consume the single-use code.
  await clearFails(supabase, email);
  await supabase.from("email_otps").update({ consumed: true }).eq("id", otp.id);

  const record = {
    name,
    email,
    project_type: b.project_type || null,
    budget: b.budget || null,
    timeline: b.timeline || null,
    description: b.description || null,
    tech_stack: b.tech_stack || null,
    features: b.features || null,
    additional_features: b.additional_features || null,
  };

  const { error: insErr } = await supabase.from("project_requests").insert(record);
  if (insErr)
    return json({ success: false, error: "Could not save request" }, 500);

  // Email notification to the owner.
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const to = Deno.env.get("CONTACT_TO_EMAIL") || sender;
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "Vishal Kushwaha";
  const ownerName = Deno.env.get("OWNER_NAME") || "Vishal";

  if (apiKey && sender) {
    try {
      await sendBrevo(
        {
          sender: { name: "Project Request", email: sender },
          to: [{ email: to }],
          replyTo: { email, name },
          subject: `New project request from ${name}`,
          htmlContent: `
            <h3>New project request</h3>
            ${row("Name", name)}
            ${row("Email", email)}
            ${row("Project type", record.project_type || "")}
            ${row("Budget", record.budget || "")}
            ${row("Timeline", record.timeline || "")}
            ${row("Description", record.description || "")}
            ${row("Preferred tech stack", record.tech_stack || "")}
            ${row("Key features", record.features || "")}
            ${row("Additional features", record.additional_features || "")}
          `,
        },
        apiKey
      );

      // Confirmation to the requester.
      await sendBrevo(
        {
          sender: { name: senderName, email: sender },
          to: [{ email, name }],
          subject: `Thanks for your project request, ${name}!`,
          htmlContent: `
            <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
              <p>Hi ${esc(name)},</p>
              <p>Thanks for sending over your project details — I've received your
              request and will review it and get back to you personally, usually
              within 24&ndash;48 hours.</p>
              <p>Talk soon,<br><b>${esc(ownerName)}</b></p>
            </div>`,
        },
        apiKey
      );
    } catch {
      // Request is already saved; email failure shouldn't fail the request.
    }
  }

  return json({ success: true });
});
