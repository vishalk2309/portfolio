// Supabase Edge Function: notify-subscribers
//
// Emails all blog subscribers about a newly published post — once per post
// (guarded by blogs.subscribers_notified). Called from the admin when a post
// is published.
//
// Deploy:
//   supabase functions deploy notify-subscribers --no-verify-jwt
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
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Brevo ${r.status}`);
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
    .select("id,title,slug,excerpt,published,subscribers_notified")
    .eq("id", blogId)
    .maybeSingle();

  if (!post) return json({ success: false, error: "Post not found" }, 404);
  if (!post.published) return json({ success: true, skipped: "not published" });
  if (post.subscribers_notified)
    return json({ success: true, skipped: "already notified" });

  const { data: subs } = await supabase
    .from("blog_subscribers")
    .select("email");
  const emails = (subs || []).map((s: { email: string }) => s.email).filter(Boolean);

  // Mark notified first so we never double-send even if this is retried.
  await supabase.from("blogs").update({ subscribers_notified: true }).eq("id", blogId);

  if (emails.length === 0) return json({ success: true, sent: 0 });

  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "Vishal Kushwaha";
  const site = (Deno.env.get("SITE_URL") || "https://vishalworks.co.in").replace(/\/$/, "");
  if (!apiKey || !sender)
    return json({ success: false, error: "Email service not configured" }, 500);

  // Send in BCC batches so subscribers can't see each other.
  const batchSize = 90;
  try {
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await sendBrevo(
        {
          sender: { name: senderName, email: sender },
          to: [{ email: sender, name: senderName }],
          bcc: batch.map((email) => ({ email })),
          subject: `New post: ${post.title}`,
          htmlContent: `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
            <h2 style="margin:0 0 8px">${esc(post.title)}</h2>
            ${post.excerpt ? `<p style="color:#555">${esc(post.excerpt)}</p>` : ""}
            <p><a href="${site}/blog/${post.slug}">Read the full post →</a></p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
            <p style="font-size:12px;color:#999">You're receiving this because you subscribed to the blog.</p>
          </div>`,
        },
        apiKey
      );
    }
  } catch {
    return json({ success: false, error: "Some emails failed to send" }, 502);
  }

  return json({ success: true, sent: emails.length });
});
