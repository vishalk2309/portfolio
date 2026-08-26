// Supabase Edge Function: notify-job-subscribers
//
// Emails all job subscribers about a newly posted job.
// Called from the admin when a job update is published.
//
// Deploy:
//   supabase functions deploy notify-job-subscribers --no-verify-jwt
//
// Secrets: BREVO_API_KEY, BREVO_SENDER_EMAIL, optional BREVO_SENDER_NAME,
// optional SITE_URL (default https://vishalworks.co.in).

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

const esc = (s = "") =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        } as Record<string, string>
      )[c]
  );

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
  if (!r.ok) throw new Error(`Brevo ${r.status}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  let b: { job_id?: string };
  try {
    b = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }
  const jobId = String(b.job_id || "").trim();
  if (!jobId) return json({ success: false, error: "Missing job_id" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get the job update
  const { data: job } = await supabase
    .from("job_updates")
    .select("id,title,slug,description,company,position,location,job_type,experience,qualification,apply_url,published")
    .eq("id", jobId)
    .maybeSingle();

  if (!job) return json({ success: false, error: "Job not found" }, 404);
  if (!job.published) return json({ success: true, skipped: "not published" });

  // Get all active subscribers
  const { data: subs } = await supabase
    .from("job_subscribers")
    .select("email")
    .eq("is_active", true);
  const emails = (subs || [])
    .map((s: { email: string }) => s.email)
    .filter(Boolean);

  if (emails.length === 0) return json({ success: true, sent: 0 });

  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "Vishal Kushwaha";
  const site = (Deno.env.get("SITE_URL") || "https://www.vishalworks.co.in").replace(/\/$/, "");

  if (!apiKey || !sender)
    return json({ success: false, error: "Email service not configured" }, 500);

  // Build job details HTML
  const jobDetailsHtml = `
    <div style="background-color:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0">
      <h2 style="margin:0 0 12px;color:#1f2937;font-size:20px">${esc(job.title)}</h2>
      ${job.company ? `<p style="margin:8px 0;color:#555"><strong>💼 Company:</strong> ${esc(job.company)}</p>` : ""}
      ${job.position ? `<p style="margin:8px 0;color:#555"><strong>📌 Position:</strong> ${esc(job.position)}</p>` : ""}
      ${job.location ? `<p style="margin:8px 0;color:#555"><strong>📍 Location:</strong> ${esc(job.location)}</p>` : ""}
      ${job.job_type ? `<p style="margin:8px 0;color:#555"><strong>🏢 Type:</strong> ${esc(job.job_type)}</p>` : ""}
      ${job.experience ? `<p style="margin:8px 0;color:#555"><strong>📚 Experience:</strong> ${esc(job.experience)}</p>` : ""}
      ${job.qualification ? `<p style="margin:8px 0;color:#555"><strong>🎓 Qualification:</strong> ${esc(job.qualification)}</p>` : ""}
    </div>
  `;

  const htmlContent = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <h2 style="margin:0 0 8px;color:#1f2937">🎉 New Job Update Posted!</h2>
      <p style="color:#666;margin:0 0 16px">You're subscribed to job updates from Vishal Kushwaha</p>

      <p>Hi there,</p>
      <p>A new job update has been posted. Here are the details:</p>

      ${jobDetailsHtml}

      ${job.description ? `<p style="color:#555;margin:16px 0;font-style:italic">${esc(job.description)}</p>` : ""}

      <p style="margin:20px 0;text-align:center">
        <a href="${job.apply_url || `${site}/job/${job.slug}`}" style="background-color:#6ee7f9;color:#000;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;margin-right:10px">🚀 Apply Now</a>
        <a href="${site}/job/${job.slug}" style="background-color:#f3f4f6;color:#1f2937;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">View Details</a>
      </p>

      <p style="text-align:center"><a href="${site}/jobs" style="color:#6ee7f9;text-decoration:none;font-size:14px">See all job updates</a></p>

      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="font-size:12px;color:#999">You're receiving this because you subscribed to job updates from Vishal Kushwaha.</p>
    </div>
  `;

  // Send in BCC batches so subscribers can't see each other
  const batchSize = 90;
  try {
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await sendBrevo(
        {
          sender: { name: senderName, email: sender },
          to: [{ email: sender, name: senderName }],
          bcc: batch.map((email) => ({ email })),
          subject: `New Job Update: ${job.title}`,
          htmlContent,
        },
        apiKey
      );
    }
  } catch (error) {
    console.error("Error sending emails:", error);
    return json({ success: false, error: "Some emails failed to send" }, 502);
  }

  return json({ success: true, sent: emails.length });
});
