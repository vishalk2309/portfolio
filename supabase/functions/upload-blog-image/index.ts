// Supabase Edge Function: upload-blog-image
//
// Lets the public blog editor upload an image WITHOUT giving visitors direct
// write access to storage. The browser sends the file as base64; this uploads
// it to the media bucket with the service role and returns the public URL.
//
// Deploy:
//   supabase functions deploy upload-blog-image --no-verify-jwt

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

const ALLOWED = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  let b: { filename?: string; contentType?: string; data?: string };
  try {
    b = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const contentType = String(b.contentType || "");
  const data = String(b.data || "");
  if (!ALLOWED.includes(contentType))
    return json({ success: false, error: "Only PNG, JPEG, GIF or WEBP images." }, 400);
  if (!data)
    return json({ success: false, error: "No image data." }, 400);

  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  } catch {
    return json({ success: false, error: "Could not read image." }, 400);
  }
  if (bytes.length === 0 || bytes.length > MAX_BYTES)
    return json({ success: false, error: "Image must be under 5 MB." }, 400);

  const ext = (contentType.split("/")[1] || "png").replace("jpeg", "jpg");
  const path = `blog/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error } = await supabase.storage
    .from("media")
    .upload(path, bytes, { contentType, upsert: false });
  if (error)
    return json({ success: false, error: "Upload failed." }, 500);

  const url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  return json({ success: true, url });
});
