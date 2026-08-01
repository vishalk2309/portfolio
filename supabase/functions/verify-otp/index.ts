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

const MAX_FAILS = 5;
const LOCK_MINUTES = 30;

// Returns minutes remaining if the email is currently locked, else 0.
// deno-lint-ignore no-explicit-any
async function lockMinutesLeft(supabase: any, email: string): Promise<number> {
  const { data } = await supabase
    .from("otp_lockouts")
    .select("locked_until")
    .eq("email", email)
    .maybeSingle();
  if (!data?.locked_until) return 0;
  const leftMs = new Date(data.locked_until).getTime() - Date.now();
  return leftMs > 0 ? Math.ceil(leftMs / 60000) : 0;
}

// Record a wrong entry. When the 5th one lands, lock the email for 30 min and
// reset the counter. Returns true if the email is now locked.
// deno-lint-ignore no-explicit-any
async function registerFail(supabase: any, email: string): Promise<boolean> {
  const { data } = await supabase
    .from("otp_lockouts")
    .select("fail_count")
    .eq("email", email)
    .maybeSingle();
  const fails = (data?.fail_count || 0) + 1;
  const nowIso = new Date().toISOString();
  if (fails >= MAX_FAILS) {
    await supabase.from("otp_lockouts").upsert({
      email,
      fail_count: 0,
      locked_until: new Date(Date.now() + LOCK_MINUTES * 60000).toISOString(),
      updated_at: nowIso,
    });
    return true;
  }
  await supabase
    .from("otp_lockouts")
    .upsert({ email, fail_count: fails, locked_until: null, updated_at: nowIso });
  return false;
}

// deno-lint-ignore no-explicit-any
async function clearFails(supabase: any, email: string): Promise<void> {
  await supabase.from("otp_lockouts").upsert({
    email,
    fail_count: 0,
    locked_until: null,
    updated_at: new Date().toISOString(),
  });
}

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

  // Blocked from too many wrong entries? Reject before checking anything.
  const locked = await lockMinutesLeft(supabase, email);
  if (locked > 0)
    return json({
      valid: false,
      error: `Too many failed attempts. Try again in ${locked} minute(s).`,
    });

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
  if (code !== otp.code) {
    await supabase
      .from("email_otps")
      .update({ attempts: otp.attempts + 1 })
      .eq("id", otp.id);
    const nowLocked = await registerFail(supabase, email);
    return json({
      valid: false,
      error: nowLocked
        ? `Too many failed attempts. Your email is locked for ${LOCK_MINUTES} minutes.`
        : "Incorrect code.",
    });
  }

  // Valid — clear failures; do NOT consume the code here (submit re-verifies + consumes).
  await clearFails(supabase, email);
  return json({ valid: true });
});
