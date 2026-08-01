-- ============================================================
-- OTP lockout: after 5 wrong code entries, block the email for 30 minutes.
--
-- Paste into Supabase → SQL Editor → Run. Idempotent (safe to re-run).
-- Already included in setup-features.sql — this standalone file is for
-- adding the feature to an existing setup without re-running everything.
--
-- The lockout survives "Resend code" because send-otp, verify-otp,
-- submit-project-request and submit-blog all check locked_until first.
-- ============================================================

create table if not exists otp_lockouts (
  email        text primary key,
  fail_count   int not null default 0,   -- consecutive wrong entries since last success/lock
  locked_until timestamptz,              -- while > now(), the email is blocked
  updated_at   timestamptz not null default now()
);

alter table otp_lockouts enable row level security;
-- No policies: only the Edge Functions (service role) touch this table.
