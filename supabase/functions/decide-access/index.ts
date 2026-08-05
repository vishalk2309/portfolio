// Supabase Edge Function: decide-access
//
// Powers the Approve / Decline buttons on the dashboard's Access Requests
// screen. Verifies the caller is YOU (by the JWT's email, same rule as
// is_owner() in SQL), records the decision, and emails the requester.
//
// The decision runs through a function rather than a direct table update so the
// notification email can't be forged by a visitor, and so access_requests needs
// no UPDATE policy at all.
//
// Deploy:
//   supabase functions deploy decide-access --no-verify-jwt
//
// Required secrets:
//   OWNER_EMAIL         - your admin login email (who may approve)
//   BREVO_API_KEY, BREVO_SENDER_EMAIL
// Optional: BREVO_SENDER_NAME, OWNER_NAME, SITE_URL

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

function escapeHtml(s = ""): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ]!)
  );
}

const NOTE_MAX = 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  let body: { requestId?: number | string; decision?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const { requestId, decision } = body;
  const note = String(body.note || "").trim().slice(0, NOTE_MAX);
  if (!requestId)
    return json({ success: false, error: "Missing requestId" }, 400);
  if (decision !== "approved" && decision !== "declined")
    return json({ success: false, error: "Invalid decision" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Only the owner may decide. Compare against OWNER_EMAIL, mirroring
  // is_owner() so the SQL and the function can never disagree.
  const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token);
  const caller = userData?.user;
  const owner = (Deno.env.get("OWNER_EMAIL") || "").toLowerCase();
  if (!caller) return json({ success: false, error: "Please log in." }, 401);
  if (!owner)
    return json(
      { success: false, error: "OWNER_EMAIL secret is not set." },
      500
    );
  if ((caller.email || "").toLowerCase() !== owner)
    return json({ success: false, error: "Not allowed." }, 403);

  const { data: updated, error: updErr } = await supabase
    .from("access_requests")
    .update({
      status: decision,
      note: note || null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select("id, email, name, status, note, resources(title)")
    .maybeSingle();

  if (updErr || !updated)
    return json({ success: false, error: "Could not save the decision." }, 500);

  // Tell the requester. As with request-access, a mail failure doesn't undo the
  // decision — it's already recorded and the resources page will reflect it.
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "Vishal Kushwaha";
  const ownerName = Deno.env.get("OWNER_NAME") || "Vishal";
  const siteUrl = Deno.env.get("SITE_URL") || "";
  const title = (updated as { resources?: { title?: string } }).resources?.title || "the resource";
  let emailed = false;

  if (apiKey && sender && updated.email) {
    const approved = decision === "approved";
    const libraryLink = siteUrl
      ? `<p><a href="${siteUrl}/account" style="display:inline-block;background:#6EE7F9;color:#08131a;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:600">Open My Library</a></p>`
      : `<p>Sign in and open <b>My Library</b> to download it.</p>`;
    try {
      const r = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: { email: sender, name: senderName },
          to: [{ email: updated.email, name: updated.name || undefined }],
          subject: approved
            ? `Access approved: ${title}`
            : `About your access request: ${title}`,
          htmlContent: approved
            ? `<p>Hi ${escapeHtml(updated.name || "there")},</p>
               <p>Your request for <b>${escapeHtml(
                 title
               )}</b> has been approved — it's in your library now.</p>
               ${libraryLink}
               ${
                 note
                   ? `<p><b>Note:</b> ${escapeHtml(note).replace(/\n/g, "<br>")}</p>`
                   : ""
               }
               <p>— ${escapeHtml(ownerName)}</p>`
            : `<p>Hi ${escapeHtml(updated.name || "there")},</p>
               <p>Thanks for your interest in <b>${escapeHtml(
                 title
               )}</b>. I'm not able to share this one right now.</p>
               ${
                 note
                   ? `<p>${escapeHtml(note).replace(/\n/g, "<br>")}</p>`
                   : ""
               }
               <p>— ${escapeHtml(ownerName)}</p>`,
        }),
      });
      emailed = r.ok;
      if (!r.ok) console.error("[decide-access] Brevo", r.status, await r.text());
    } catch (e) {
      console.error("[decide-access] requester notification failed", e);
    }
  }

  return json({ success: true, status: decision, emailed });
});
