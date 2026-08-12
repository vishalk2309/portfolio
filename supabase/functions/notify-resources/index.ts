// Supabase Edge Function: notify-resources
//
// Sends a notification email to all active resource subscribers.
// Only callable by authenticated admin users.
//
// Deploy:
//   supabase functions deploy notify-resources
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

async function sendBrevo(
  recipientEmail: string,
  payload: Record<string, unknown>,
  apiKey: string
) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Brevo error: ${response.status}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  // Get the auth header to verify it's an authenticated request
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return json({ success: false, error: "Unauthorized" }, 401);
  }

  let b: {
    subject?: string;
    message?: string;
    htmlContent?: string;
  };
  try {
    b = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const subject = b.subject || "New resources added!";
  const message = b.message || "Check out the latest resources that have been added.";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch all active subscribers
  const { data: subscribers, error: fetchError } = await supabase
    .from("resource_subscriptions")
    .select("email")
    .eq("is_active", true);

  if (fetchError) {
    return json(
      { success: false, error: "Could not fetch subscribers" },
      500
    );
  }

  const emails = (subscribers || []).map((s) => s.email);
  if (emails.length === 0) {
    return json(
      { success: true, sentCount: 0, message: "No active subscribers" }
    );
  }

  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "Vishal Kushwaha";

  if (!apiKey || !sender) {
    return json(
      { success: false, error: "Email service not configured" },
      500
    );
  }

  let sentCount = 0;
  const errors: string[] = [];

  // Send email to each subscriber
  for (const email of emails) {
    try {
      await sendBrevo(
        email,
        {
          sender: { name: senderName, email: sender },
          to: [{ email }],
          subject: subject,
          htmlContent: `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
            <p>${message}</p>
            <p>Check out <a href="https://yoursite.com/resources" style="color:#0891b2;text-decoration:none">all resources</a></p>
            <p>— ${senderName}</p>
          </div>`,
        },
        apiKey
      );
      sentCount++;
    } catch (err) {
      errors.push(`Failed to send to ${email}: ${err.message}`);
    }
  }

  return json({
    success: sentCount > 0,
    sentCount,
    totalSubscribers: emails.length,
    errors: errors.length > 0 ? errors : undefined,
  });
});
