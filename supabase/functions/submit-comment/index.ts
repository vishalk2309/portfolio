// Supabase Edge Function: submit-comment
//
// Adds a comment to a published blog post (service role → no direct client
// write). Then emails the post's author (or the site owner for owner-written
// posts) that a new comment was posted.
//
// Deploy:
//   supabase functions deploy submit-comment --no-verify-jwt
//
// Secrets: BREVO_API_KEY, BREVO_SENDER_EMAIL, CONTACT_TO_EMAIL (owner
// fallback), optional SITE_URL. SUPABASE_URL + SERVICE_ROLE injected.

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

  let b: {
    blog_id?: string;
    name?: string;
    body?: string;
    parent_id?: string;
    botcheck?: unknown;
  };
  try {
    b = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  if (b.botcheck) return json({ success: true }); // honeypot

  const blogId = String(b.blog_id || "").trim();
  const name = String(b.name || "").trim().slice(0, 80);
  const body = String(b.body || "").trim();
  const parentId = String(b.parent_id || "").trim() || null;

  if (!blogId) return json({ success: false, error: "Missing post." }, 400);
  if (!name) return json({ success: false, error: "Please add your name." }, 400);
  if (body.length < 2 || body.length > 4000)
    return json({ success: false, error: "Comment is too short or too long." }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Only allow comments on a real, published post.
  const { data: post } = await supabase
    .from("blogs")
    .select("id,title,slug,author_name,author_email")
    .eq("id", blogId)
    .eq("published", true)
    .maybeSingle();
  if (!post) return json({ success: false, error: "Post not found." }, 404);

  const { data: inserted, error } = await supabase
    .from("blog_comments")
    .insert({ blog_id: blogId, name, body, parent_id: parentId })
    .select("id,name,body,created_at,parent_id")
    .single();

  if (error) return json({ success: false, error: "Could not post comment." }, 500);

  // Notify the author (or the owner for owner-written posts) — best-effort.
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const owner = Deno.env.get("CONTACT_TO_EMAIL") || sender;
  const recipient = post.author_email || owner;
  const site = (Deno.env.get("SITE_URL") || "https://vishalworks.co.in").replace(/\/$/, "");
  if (apiKey && sender && recipient) {
    try {
      await sendBrevo(
        {
          sender: { name: "Blog Comments", email: sender },
          to: [{ email: recipient, name: post.author_name || undefined }],
          subject: `New comment on "${post.title}"`,
          htmlContent: `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
            <p>${post.author_name ? `Hi ${esc(post.author_name)},` : "Hi,"}</p>
            <p><b>${esc(name)}</b> just commented on your post <b>“${esc(post.title)}”</b>:</p>
            <p style="padding:12px 16px;border-left:3px solid #6EE7F9;background:#f6feff;color:#333">${esc(body).replace(/\n/g, "<br>")}</p>
            <p><a href="${site}/blog/${post.slug}">View the post →</a></p>
          </div>`,
        },
        apiKey
      );
    } catch {
      // email failure shouldn't fail the comment
    }
  }

  return json({ success: true, comment: inserted });
});
