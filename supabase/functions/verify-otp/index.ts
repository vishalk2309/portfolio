// Supabase Edge Function: verify-otp
//
// Checks whether a 6-digit code is valid for an email WITHOUT consuming it.
// Used by the blog write form to gate the submit button behind a real
// "Validate" step. The final verify+consume still happens at submit time.
//
// Deploy:
//   supabase functions deploy verify-otp --no-verify-jwt

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
    return json({ valid: false, error: "Method not allowed" }, 405);

  let b: { email?: string; code?: string };
  try {
    b = await req.json();
  } catch {
    return json({ valid: false, error: "Invalid JSON" }, 400);
  }

  const email = String(b.email || "").trim().toLowerCase();
  const code = String(b.code || "").trim();
  if (!email || !code)
    return json({ valid: false, error: "Missing email or code." }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: otps } = await supabase
    .from("email_otps")
    .select("*")
    .eq("email", email)
    .eq("consumed", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  const otp = otps?.[0];
  if (!otp)
    return json({ valid: false, error: "Code expired. Request a new one." });
  if (otp.attempts >= 5)
    return json({ valid: false, error: "Too many attempts. Request a new code." });
  if (code !== otp.code) {
    await supabase
      .from("email_otps")
      .update({ attempts: otp.attempts + 1 })
      .eq("id", otp.id);
    return json({ valid: false, error: "Incorrect code." });
  }

  // Valid — do NOT consume here; submit-blog verifies + consumes at submit.
  return json({ valid: true });
});
