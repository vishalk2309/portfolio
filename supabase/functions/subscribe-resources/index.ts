// Supabase Edge Function: subscribe-resources
//
// Adds an email to the resources newsletter list and sends a confirmation email.
//
// Deploy:
//   supabase functions deploy subscribe-resources --no-verify-jwt
//
// Secrets: BREVO_API_KEY, BREVO_SENDER_EMAIL, optional BREVO_SENDER_NAME.

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

  let b: { email?: string; botcheck?: unknown };
  try {
    b = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  if (b.botcheck) return json({ success: true }); // honeypot

  const email = String(b.email || "").trim().toLowerCase();
  if (!isEmail(email)) return json({ success: false, error: "Invalid email" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error } = await supabase
    .from("resource_subscriptions")
    .insert({ email })
    .select("id")
    .maybeSingle();

  // Unique-violation = already subscribed; treat as success.
  if (error && error.code !== "23505")
    return json({ success: false, error: "Could not subscribe." }, 500);

  // Confirmation email (best-effort).
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "Vishal Kushwaha";
  if (apiKey && sender) {
    try {
      await sendBrevo(
        {
          sender: { name: senderName, email: sender },
          to: [{ email }],
          subject: "You're subscribed to resources updates",
          htmlContent: `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
            <p>Thanks for subscribing! You'll get an email whenever new resources are added.</p>
            <p>— ${senderName}</p>
          </div>`,
        },
        apiKey
      );
    } catch {
      /* ignore */
    }
  }

  return json({ success: true });
});
