// Supabase Edge Function: create-order
//
// Step 1 of the paid-download flow. The browser sends ONLY a resourceId.
// This function looks up the resource server-side, reads its real price from
// the database (never trusts a price from the client), and creates a Razorpay
// order. It returns the order id + public Razorpay key so the browser can open
// the Razorpay checkout.
//
// Deploy:
//   supabase functions deploy create-order --no-verify-jwt
//
// Required secrets:
//   RAZORPAY_KEY_ID       - Razorpay → Settings → API Keys (public-ish id)
//   RAZORPAY_KEY_SECRET   - the secret half of that key pair (SERVER ONLY)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

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

  let body: { resourceId?: number | string };
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const resourceId = body.resourceId;
  if (!resourceId) return json({ success: false, error: "Missing resourceId" }, 400);

  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret)
    return json({ success: false, error: "Payments not configured" }, 500);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Require a logged-in buyer. supabase.functions.invoke() forwards the user's
  // access token as the Authorization header when they have a session.
  const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData?.user)
    return json({ success: false, error: "Please log in to buy this." }, 401);
  const buyer = userData.user;

  // Read the resource server-side — the price comes from the DB, not the client.
  const { data: resource, error } = await supabase
    .from("resources")
    .select("id, title, is_paid, price, currency, file_path, access_type")
    .eq("id", resourceId)
    .maybeSingle();

  if (error || !resource)
    return json({ success: false, error: "Resource not found" }, 404);
  // Request-only resources are granted by approval, never sold — refuse here so
  // nobody can buy their way past the gate.
  if (resource.access_type === "request")
    return json(
      { success: false, error: "This resource is available by request only" },
      400
    );
  if (!resource.is_paid || !resource.price || resource.price <= 0)
    return json({ success: false, error: "This resource is not for sale" }, 400);

  // The resource must have SOMETHING to deliver: either its own single file
  // (file_path) or at least one file in resource_files (a "folder").
  if (!resource.file_path) {
    const { count } = await supabase
      .from("resource_files")
      .select("id", { count: "exact", head: true })
      .eq("resource_id", resource.id);
    if (!count)
      return json(
        { success: false, error: "This resource has no files yet" },
        400
      );
  }

  const currency = resource.currency || "INR";
  const amount = Math.round(Number(resource.price) * 100); // paise
  if (amount < 100)
    return json({ success: false, error: "Amount must be at least ₹1" }, 400);

  // Create the Razorpay order.
  const auth = "Basic " + btoa(`${keyId}:${keySecret}`);
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: auth, "content-type": "application/json" },
    body: JSON.stringify({
      amount,
      currency,
      // notes travel back on the webhook → we can record the purchase
      // server-side even if the buyer's browser never calls verify-payment.
      notes: {
        resourceId: String(resource.id),
        title: resource.title,
        userId: buyer.id,
        email: buyer.email || "",
      },
    }),
  });

  if (!r.ok) {
    const detail = await r.text();
    return json({ success: false, error: "Could not create order", detail }, 502);
  }
  const order = await r.json();

  return json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId, // public Razorpay key id — safe to expose to the checkout
    title: resource.title,
  });
});
