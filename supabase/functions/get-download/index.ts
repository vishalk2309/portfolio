// Supabase Edge Function: get-download
//
// Powers the "Download again" button in a buyer's library. Requires a logged-in
// user, checks they actually PURCHASED the resource, and only then mints a
// fresh short-lived signed URL for the private file.
//
// Deploy:
//   supabase functions deploy get-download --no-verify-jwt
//
// No extra secrets — SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected.

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

const SIGNED_URL_SECONDS = 300;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  let body: { resourceId?: number | string };
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }
  const resourceId = body.resourceId;
  if (!resourceId) return json({ success: false, error: "Missing resourceId" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Who's asking?
  const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token);
  const user = userData?.user;
  if (!user) return json({ success: false, error: "Please log in." }, 401);

  // Did THIS user buy THIS resource?
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("resource_id", resourceId)
    .limit(1)
    .maybeSingle();
  if (!purchase)
    return json({ success: false, error: "You haven't purchased this." }, 403);

  const { data: resource } = await supabase
    .from("resources")
    .select("file_path, file_name")
    .eq("id", resourceId)
    .maybeSingle();
  if (!resource?.file_path)
    return json({ success: false, error: "File unavailable." }, 404);

  const { data: signed, error: signErr } = await supabase.storage
    .from("paid-resources")
    .createSignedUrl(resource.file_path, SIGNED_URL_SECONDS, {
      download: resource.file_name || true,
    });
  if (signErr || !signed?.signedUrl)
    return json({ success: false, error: "Could not prepare download." }, 500);

  return json({ success: true, url: signed.signedUrl });
});
