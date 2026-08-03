// Supabase Edge Function: verify-payment
//
// Step 2 of the paid-download flow. After Razorpay checkout succeeds, the
// browser sends the order id, payment id and signature. This function verifies
// the signature with the SECRET key (so a forged success can't unlock a file),
// and only then generates a short-lived signed URL for the PRIVATE file and
// logs the purchase.
//
// Deploy:
//   supabase functions deploy verify-payment --no-verify-jwt
//
// Required secrets: RAZORPAY_KEY_SECRET (SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are injected automatically).

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

// HMAC-SHA256(message, secret) as lowercase hex — the scheme Razorpay uses.
async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// constant-time-ish string compare
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const SIGNED_URL_SECONDS = 300; // 5 minutes to start the download

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  let b: {
    resourceId?: number | string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    email?: string;
    name?: string;
  };
  try {
    b = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const { resourceId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = b;
  if (!resourceId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return json({ success: false, error: "Missing payment details" }, 400);

  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keySecret)
    return json({ success: false, error: "Payments not configured" }, 500);

  // Verify the signature: HMAC(order_id + "|" + payment_id) must equal the
  // signature Razorpay returned. A mismatch means the success is forged.
  const expected = await hmacSha256Hex(
    keySecret,
    `${razorpay_order_id}|${razorpay_payment_id}`
  );
  if (!safeEqual(expected, razorpay_signature))
    return json({ success: false, error: "Payment verification failed" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Identify the buyer so the purchase is tied to their account (for their
  // library later). Login is required to reach checkout, so this should exist.
  const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token);
  const user = userData?.user || null;

  const { data: resource, error } = await supabase
    .from("resources")
    .select("id, title, is_paid, price, currency, file_path, file_name")
    .eq("id", resourceId)
    .maybeSingle();

  if (error || !resource || !resource.is_paid || !resource.file_path)
    return json({ success: false, error: "Resource not available" }, 404);

  // Signed URL to the PRIVATE file — expires quickly, forces a download.
  const { data: signed, error: signErr } = await supabase.storage
    .from("paid-resources")
    .createSignedUrl(resource.file_path, SIGNED_URL_SECONDS, {
      download: resource.file_name || true,
    });

  if (signErr || !signed?.signedUrl)
    return json({ success: false, error: "Could not prepare download" }, 500);

  // Best-effort purchase log (never block the download if this fails).
  try {
    await supabase.from("purchases").insert({
      resource_id: resource.id,
      user_id: user?.id || null,
      email: b.email || user?.email || null,
      name: b.name || null,
      amount: resource.price,
      currency: resource.currency || "INR",
      razorpay_order_id,
      razorpay_payment_id,
    });
  } catch {
    // ignore
  }

  return json({ success: true, url: signed.signedUrl });
});
