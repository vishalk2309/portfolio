// Supabase Edge Function: razorpay-webhook
//
// Production reliability net. Razorpay calls this server-to-server after a
// payment, so the purchase is recorded even if the buyer's browser closed
// before verify-payment ran. It verifies Razorpay's webhook signature, then
// records the purchase (deduped by payment id).
//
// Deploy:
//   supabase functions deploy razorpay-webhook --no-verify-jwt
//
// Setup in Razorpay → Settings → Webhooks:
//   URL:    https://<project>.supabase.co/functions/v1/razorpay-webhook
//   Secret: (any strong string) → also store it as the RAZORPAY_WEBHOOK_SECRET
//           secret in Supabase
//   Events: payment.captured
//
// Required secret: RAZORPAY_WEBHOOK_SECRET (SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are injected automatically).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return new Response("Not configured", { status: 500 });

  // The signature is over the RAW body bytes — read text before parsing.
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const expected = await hmacSha256Hex(secret, raw);
  if (!safeEqual(expected, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: Record<string, unknown> } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // We only act on a captured (successful) payment.
  if (event.event !== "payment.captured") {
    return new Response("ignored", { status: 200 });
  }

  const payment = event.payload?.payment?.entity || {};
  const notes = (payment.notes as Record<string, string>) || {};
  const resourceId = notes.resourceId ? Number(notes.resourceId) : null;

  if (!resourceId) return new Response("no resource", { status: 200 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Record the purchase, deduped by payment id (browser call may have already
  // inserted it — ignoreDuplicates makes this a no-op in that case).
  try {
    await supabase.from("purchases").upsert(
      {
        resource_id: resourceId,
        user_id: notes.userId || null,
        email: notes.email || (payment.email as string) || null,
        amount:
          payment.amount != null ? Number(payment.amount) / 100 : null,
        currency: (payment.currency as string) || "INR",
        razorpay_order_id: (payment.order_id as string) || null,
        razorpay_payment_id: (payment.id as string) || null,
      },
      { onConflict: "razorpay_payment_id", ignoreDuplicates: true }
    );
  } catch {
    // ignore — respond 200 regardless so Razorpay doesn't retry forever
  }

  return new Response("ok", { status: 200 });
});
