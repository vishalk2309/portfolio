// Supabase Edge Function: request-access
//
// Powers the "Request access" button on a request-only resource. Requires a
// logged-in visitor, records (or re-opens) their request as PENDING, and emails
// you so you can approve it from the dashboard.
//
// Requests are written here rather than straight from the browser on purpose:
// if visitors could insert into access_requests directly they could simply set
// status = 'approved' for themselves.
//
// Deploy:
//   supabase functions deploy request-access --no-verify-jwt
//
// Required secrets (already set if the contact form works):
//   BREVO_API_KEY, BREVO_SENDER_EMAIL, CONTACT_TO_EMAIL
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

const REASON_MAX = 1000;
const NAME_MAX = 120;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ success: false, error: "Method not allowed" }, 405);

  let body: { resourceId?: number | string; reason?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const { resourceId } = body;
  if (!resourceId)
    return json({ success: false, error: "Missing resourceId" }, 400);

  const reason = String(body.reason || "").trim().slice(0, REASON_MAX);
  const name = String(body.name || "").trim().slice(0, NAME_MAX);
  if (!reason)
    return json(
      { success: false, error: "Please say what you need this for." },
      400
    );

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Who's asking? invoke() forwards the visitor's access token for us.
  const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token);
  const user = userData?.user;
  if (!user)
    return json(
      { success: false, error: "Please sign in to request access." },
      401
    );

  // The resource must exist and actually be request-gated — don't let someone
  // open a request against a free or paid item.
  const { data: resource } = await supabase
    .from("resources")
    .select("id, title, access_type")
    .eq("id", resourceId)
    .maybeSingle();
  if (!resource)
    return json({ success: false, error: "Resource not found" }, 404);
  if (resource.access_type !== "request")
    return json(
      { success: false, error: "This resource doesn't need a request." },
      400
    );

  // Already approved? Don't reset it back to pending and lose their access.
  const { data: existing } = await supabase
    .from("access_requests")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("resource_id", resource.id)
    .maybeSingle();

  if (existing?.status === "approved")
    return json({ success: true, status: "approved", alreadyGranted: true });
  if (existing?.status === "pending")
    return json({ success: true, status: "pending", alreadyPending: true });

  // New request, or re-opening one you previously declined.
  const { error: upsertErr } = await supabase
    .from("access_requests")
    .upsert(
      {
        resource_id: resource.id,
        user_id: user.id,
        email: user.email || null,
        name: name || null,
        reason,
        status: "pending",
        note: null,
        created_at: new Date().toISOString(),
        decided_at: null,
      },
      { onConflict: "user_id,resource_id" }
    );
  if (upsertErr)
    return json(
      { success: false, error: "Could not save your request." },
      500
    );

  // Tell the owner. A mail failure must NOT lose the request — it's already
  // saved and visible in the dashboard, so we only log and still return ok.
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  const to = Deno.env.get("CONTACT_TO_EMAIL") || sender;
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "Vishal Kushwaha";
  const siteUrl = Deno.env.get("SITE_URL") || "";

  if (apiKey && sender && to) {
    try {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: { email: sender, name: senderName },
          to: [{ email: to }],
          replyTo: user.email ? { email: user.email } : undefined,
          subject: `Access request: ${resource.title || "resource"}`,
          htmlContent: `
            <h2>New access request</h2>
            <p><b>Resource:</b> ${escapeHtml(resource.title || "")}</p>
            <p><b>From:</b> ${escapeHtml(name || "—")} &lt;${escapeHtml(
            user.email || ""
          )}&gt;</p>
            <p><b>Why they need it:</b></p>
            <blockquote style="border-left:3px solid #6EE7F9;margin:0;padding:4px 12px;color:#444">
              ${escapeHtml(reason).replace(/\n/g, "<br>")}
            </blockquote>
            <p style="margin-top:20px">
              Approve or decline it in your dashboard${
                siteUrl ? `: <a href="${siteUrl}/admin">${siteUrl}/admin</a>` : ""
              }
            </p>`,
        }),
      });
    } catch (e) {
      console.error("[request-access] owner notification failed", e);
    }
  }

  return json({ success: true, status: "pending" });
});
