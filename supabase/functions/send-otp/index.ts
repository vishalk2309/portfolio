// Supabase Edge Function: send-otp
//
// Emails a 6-digit verification code to the address entered in the
// "Request a Project" form, and stores it (hashed only by obscurity —
// short-lived + single-use) in the email_otps table.
//
// Deploy:
//   supabase functions deploy send-otp --no-verify-jwt
//
// Uses the same Brevo secrets as send-contact (BREVO_API_KEY,
// BREVO_SENDER_EMAIL, optional BREVO_SENDER_NAME). SUPABASE_URL and
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!isEmail(email)) return json({ success: false, error: "Invalid email" }, 400);

  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "Vishal Kushwaha";
  if (!apiKey || !sender)
    return json({ success: false, error: "Email service not configured" }, 500);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Lockout: 5 wrong code entries blocks the email for 30 min — including
  // requesting a NEW code, so "Resend" can't reset the block.
  const { data: lock } = await supabase
    .from("otp_lockouts")
    .select("locked_until")
    .eq("email", email)
    .maybeSingle();
  if (lock?.locked_until) {
    const leftMs = new Date(lock.locked_until).getTime() - Date.now();
    if (leftMs > 0)
      return json(
        {
          success: false,
          error: `Too many failed attempts. Try again in ${Math.ceil(
            leftMs / 60000
          )} minute(s).`,
        },
        429
      );
  }

  // Rate limit: min 45s between codes, max 5 per hour per email.
  const nowMs = Date.now();
  const { data: recent } = await supabase
    .from("email_otps")
    .select("created_at")
    .eq("email", email)
    .gte("created_at", new Date(nowMs - 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false });

  if (recent && recent.length) {
    const lastMs = new Date(recent[0].created_at).getTime();
    if (nowMs - lastMs < 45 * 1000)
      return json(
        { success: false, error: "Please wait a moment before requesting another code." },
        429
      );
    if (recent.length >= 5)
      return json(
        { success: false, error: "Too many codes requested. Try again later." },
        429
      );
  }

  const code = String(
    crypto.getRandomValues(new Uint32Array(1))[0] % 1000000
  ).padStart(6, "0");
  const expires = new Date(nowMs + 10 * 60 * 1000).toISOString();

  const { error: insErr } = await supabase
    .from("email_otps")
    .insert({ email, code, expires_at: expires });
  if (insErr) return json({ success: false, error: "Could not create code" }, 500);

  try {
    await sendBrevo(
      {
        sender: { name: senderName, email: sender },
        to: [{ email }],
        subject: `Your verification code: ${code}`,
        htmlContent: `
          <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;color:#111">
            <p>Here's your verification code for the project request form:</p>
            <p style="font-size:30px;font-weight:700;letter-spacing:6px;margin:12px 0">${code}</p>
            <p style="color:#666">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
          </div>`,
      },
      apiKey
    );
  } catch {
    return json({ success: false, error: "Could not send email" }, 502);
  }

  return json({ success: true });
});
