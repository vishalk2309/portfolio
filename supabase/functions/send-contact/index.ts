// Supabase Edge Function: send-contact
//
// Called by the portfolio contact form. Sends TWO emails via Brevo's
// transactional API:
//   1) a notification to YOU (so you see the enquiry)
//   2) an automated reply to the VISITOR (so they know you received it)
//
// The Brevo API key lives as a Supabase secret — never exposed to the browser.
//
// Deploy:
//   supabase functions deploy send-contact --no-verify-jwt
//
// Required secrets (set with `supabase secrets set KEY=value`):
//   BREVO_API_KEY       - Brevo → SMTP & API → API Keys
//   BREVO_SENDER_EMAIL  - a verified sender in Brevo → Senders
//   CONTACT_TO_EMAIL    - where enquiries should land (your inbox)
// Optional secrets:
//   BREVO_SENDER_NAME   - display name on outgoing mail (default "Vishal Kushwaha")
//   OWNER_NAME          - your name, used in the auto-reply signature

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

function escapeHtml(s = ""): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ]!)
  );
}

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
  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`Brevo ${r.status}: ${detail}`);
  }
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  let body: { name?: string; email?: string; message?: string; botcheck?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const { name, email, message, botcheck } = body;

  // honeypot — silently accept bots without sending anything
  if (botcheck) return json({ success: true });

  if (!name || !email || !message) {
    return json({ success: false, error: "Missing fields" }, 400);
  }

  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const to = Deno.env.get("CONTACT_TO_EMAIL") || sender;
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "Vishal Kushwaha";
  const ownerName = Deno.env.get("OWNER_NAME") || "Vishal";

  if (!apiKey || !sender) {
    return json({ success: false, error: "Email service not configured" }, 500);
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  try {
    // 1) Notification to you
    await sendBrevo(
      {
        sender: { name: "Portfolio Contact", email: sender },
        to: [{ email: to }],
        replyTo: { email, name },
        subject: `Portfolio message from ${name}`,
        htmlContent: `
          <h3>New message from your portfolio</h3>
          <p><b>Name:</b> ${safeName}</p>
          <p><b>Email:</b> ${safeEmail}</p>
          <p><b>Message:</b><br>${safeMessage}</p>
        `,
      },
      apiKey
    );

    // 2) Auto-reply to the visitor
    await sendBrevo(
      {
        sender: { name: senderName, email: sender },
        to: [{ email, name }],
        subject: `Thanks for reaching out, ${name}!`,
        htmlContent: `
          <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
            <p>Hi ${safeName},</p>
            <p>Thanks for getting in touch through my portfolio — I've received your
            message and will get back to you personally, usually within 24&ndash;48 hours.</p>
            <p style="padding:12px 16px;border-left:3px solid #6EE7F9;background:#f6feff;color:#333">
              <b>Your message:</b><br>${safeMessage}
            </p>
            <p>Talk soon,<br><b>${escapeHtml(ownerName)}</b></p>
          </div>
        `,
      },
      apiKey
    );

    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: String(err) }, 502);
  }
});
