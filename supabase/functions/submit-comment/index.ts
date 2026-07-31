// Supabase Edge Function: submit-comment
//
// Adds a comment to a published blog post. Runs with the service role so
// visitors never get direct write access to the comments table.
//
// Deploy:
//   supabase functions deploy submit-comment --no-verify-jwt

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  let b: { blog_id?: string; name?: string; body?: string; botcheck?: unknown };
  try {
    b = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  if (b.botcheck) return json({ success: true }); // honeypot

  const blogId = String(b.blog_id || "").trim();
  const name = String(b.name || "").trim().slice(0, 80);
  const body = String(b.body || "").trim();

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
    .select("id")
    .eq("id", blogId)
    .eq("published", true)
    .maybeSingle();
  if (!post) return json({ success: false, error: "Post not found." }, 404);

  const { data: inserted, error } = await supabase
    .from("blog_comments")
    .insert({ blog_id: blogId, name, body })
    .select("id,name,body,created_at")
    .single();

  if (error) return json({ success: false, error: "Could not post comment." }, 500);

  return json({ success: true, comment: inserted });
});
