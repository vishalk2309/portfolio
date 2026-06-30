// Vercel serverless function: receives the contact form and sends an email
// via Brevo's transactional API. The Brevo API key stays secret on the server
// (set as a Vercel environment variable), never exposed to the browser.
//
// Required env vars (set in Vercel → Project → Settings → Environment Variables):
//   BREVO_API_KEY        - your Brevo API key (Brevo → SMTP & API → API Keys)
//   BREVO_SENDER_EMAIL   - a verified sender in Brevo (Brevo → Senders)
//   CONTACT_TO_EMAIL     - where messages should arrive (your inbox)

function escapeHtml(s = "") {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name, email, message, botcheck } = req.body || {};

  // honeypot — silently accept bots without sending
  if (botcheck) return res.status(200).json({ success: true });

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SENDER_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || sender;

  if (!apiKey || !sender) {
    return res
      .status(500)
      .json({ success: false, error: "Email service not configured" });
  }

  try {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Portfolio Contact", email: sender },
        to: [{ email: to }],
        replyTo: { email, name },
        subject: `Portfolio message from ${name}`,
        htmlContent: `
          <h3>New message from your portfolio</h3>
          <p><b>Name:</b> ${escapeHtml(name)}</p>
          <p><b>Email:</b> ${escapeHtml(email)}</p>
          <p><b>Message:</b><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ success: false, error: "Brevo error", detail });
    }
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ success: false, error: "Send failed" });
  }
}
