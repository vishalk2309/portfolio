// Supabase Edge Function: submit-blog
//
// Lets any visitor submit a blog post. It's saved as an UNPUBLISHED draft;
// the owner reviews and publishes it from the admin dashboard. Visitors never
// get direct write access to the blogs table — this runs with the service role.
//
// Deploy:
//   supabase functions deploy submit-blog --no-verify-jwt
//
// Optional secrets (for a "new submission" notification): BREVO_API_KEY,
// BREVO_SENDER_EMAIL, CONTACT_TO_EMAIL. SUPABASE_URL and
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

const slugify = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

// crude excerpt: strip common markdown, collapse whitespace, clamp length
const makeExcerpt = (md = "") =>
  md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

async function sendBrevo(payload: Record<string, unknown>, apiKey: string) {
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  let b: Record<string, string> & { botcheck?: unknown; tags?: string[] };
  try {
    b = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  // Honeypot — silently accept bots.
  if (b.botcheck) return json({ success: true });

  const authorName = String(b.author_name || "").trim();
  const authorEmail = String(b.author_email || "").trim().toLowerCase();
  const title = String(b.title || "").trim();
  const content = String(b.content || "").trim();
  const authorDate = String(b.author_date || "").trim(); // yyyy-mm-dd or ""
  const code = String(b.code || "").trim();
  const tags = Array.isArray(b.tags)
    ? b.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 6)
    : [];

  if (!authorName || !title || content.length < 30)
    return json(
      { success: false, error: "Please add your name, a title, and a bit more content." },
      400
    );
  if (!isEmail(authorEmail))
    return json(
      { success: false, error: "A valid email is required to verify your submission." },
      400
    );
  if (!code)
    return json(
      { success: false, error: "Enter the verification code sent to your email." },
      400
    );
  if (title.length > 160)
    return json({ success: false, error: "Title is too long." }, 400);
  if (content.length > 40000)
    return json({ success: false, error: "Content is too long." }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Verify the emailed OTP (reuses the email_otps table from project-requests.sql).
  const { data: otps } = await supabase
    .from("email_otps")
    .select("*")
    .eq("email", authorEmail)
    .eq("consumed", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);
  const otp = otps?.[0];
  if (!otp)
    return json({ success: false, error: "Code expired. Request a new one." }, 400);
  if (otp.attempts >= 5)
    return json(
      { success: false, error: "Too many attempts. Request a new code." },
      429
    );
  if (code !== otp.code) {
    await supabase
      .from("email_otps")
      .update({ attempts: otp.attempts + 1 })
      .eq("id", otp.id);
    return json({ success: false, error: "Incorrect code." }, 400);
  }
  await supabase.from("email_otps").update({ consumed: true }).eq("id", otp.id);

  // Build a unique slug.
  const base = slugify(title) || "post";
  const { data: existing } = await supabase
    .from("blogs")
    .select("slug")
    .ilike("slug", `${base}%`);
  const taken = new Set((existing || []).map((r: { slug: string }) => r.slug));
  let slug = base;
  if (taken.has(slug)) {
    let n = 2;
    while (taken.has(`${base}-${n}`)) n++;
    slug = `${base}-${n}`;
  }

  const { error } = await supabase.from("blogs").insert({
    title,
    slug,
    excerpt: makeExcerpt(content),
    content,
    tags,
    author_name: authorName,
    author_email: authorEmail || null,
    author_date: authorDate || null,
    published: false, // always a draft — owner reviews/publishes
  });

  if (error)
    return json({ success: false, error: "Could not save your post." }, 500);

  // Optional owner notification.
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const to = Deno.env.get("CONTACT_TO_EMAIL") || sender;
  if (apiKey && sender && to) {
    try {
      await sendBrevo(
        {
          sender: { name: "Blog Submission", email: sender },
          to: [{ email: to }],
          subject: `New blog submission: ${title}`,
          htmlContent: `
            <h3>New blog submission (pending review)</h3>
            <p><b>Author:</b> ${authorName}${authorEmail ? ` (${authorEmail})` : ""}</p>
            <p><b>Title:</b> ${title}</p>
            <p>Review and publish it from your admin dashboard → Blog.</p>`,
        },
        apiKey
      );
    } catch {
      // notification is best-effort
    }
  }

  return json({ success: true });
});
