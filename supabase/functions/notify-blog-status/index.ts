// Supabase Edge Function: notify-blog-status
//
// Emails the blog's author when the owner changes its status
// (in_review / published / rejected). Called from the admin dashboard.
//
// Deploy:
//   supabase functions deploy notify-blog-status --no-verify-jwt
//
// Secrets: BREVO_API_KEY, BREVO_SENDER_EMAIL, optional BREVO_SENDER_NAME,
// optional SITE_URL (default https://vishalworks.co.in).

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

const esc = (s = "") =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

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

  let b: { blog_id?: string };
  try {
    b = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }
  const blogId = String(b.blog_id || "").trim();
  if (!blogId) return json({ success: false, error: "Missing blog_id" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: post } = await supabase
    .from("blogs")
    .select("title,slug,status,author_name,author_email")
    .eq("id", blogId)
    .maybeSingle();

  if (!post) return json({ success: false, error: "Post not found" }, 404);
  if (!post.author_email) return json({ success: true, skipped: "no author email" });

  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "Vishal Kushwaha";
  const site = (Deno.env.get("SITE_URL") || "https://vishalworks.co.in").replace(/\/$/, "");
  if (!apiKey || !sender)
    return json({ success: false, error: "Email service not configured" }, 500);

  const name = esc(post.author_name || "there");
  const title = esc(post.title || "your post");

  const messages: Record<string, { subject: string; body: string }> = {
    published: {
      subject: `Your post is live: ${post.title}`,
      body: `<p>Great news, ${name} — your post <b>“${title}”</b> has been published and is now live on the blog!</p>
             <p><a href="${site}/blog/${post.slug}">Read it here →</a></p>`,
    },
    in_review: {
      subject: `Your submission is under review: ${post.title}`,
      body: `<p>Hi ${name}, your post <b>“${title}”</b> is now being reviewed. We'll let you know once it's decided.</p>`,
    },
    rejected: {
      subject: `Update on your submission: ${post.title}`,
      body: `<p>Hi ${name}, thanks for submitting <b>“${title}”</b>. After review it wasn't accepted for publishing this time — but we appreciate you taking the time to write it.</p>`,
    },
  };

  const msg = messages[post.status];
  if (!msg) return json({ success: true, skipped: `no email for status ${post.status}` });

  try {
    await sendBrevo(
      {
        sender: { name: senderName, email: sender },
        to: [{ email: post.author_email, name: post.author_name || undefined }],
        subject: msg.subject,
        htmlContent: `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
          ${msg.body}
          <p>— ${esc(senderName)}</p>
        </div>`,
      },
      apiKey
    );
  } catch {
    return json({ success: false, error: "Could not send email" }, 502);
  }

  return json({ success: true });
});
