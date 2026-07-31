-- ============================================================
-- "Request a Project" — storage + email OTP verification.
-- Run ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Inserts happen ONLY through the Edge Functions (service role, which
-- bypasses RLS), so there are no public write policies here. The admin
-- (authenticated) can read submitted requests.
-- ============================================================

create table if not exists project_requests (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  email               text not null,
  project_type        text,
  budget              text,
  timeline            text,
  description         text,
  tech_stack          text,
  features            text,
  additional_features text,
  created_at          timestamptz not null default now()
);

alter table project_requests enable row level security;

drop policy if exists "auth read project_requests" on project_requests;
create policy "auth read project_requests" on project_requests
  for select to authenticated using (true);

-- Short-lived email verification codes. Touched ONLY by Edge Functions.
create table if not exists email_otps (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  code       text not null,
  purpose    text not null default 'project_request',
  expires_at timestamptz not null,
  consumed   boolean not null default false,
  attempts   int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists email_otps_email_idx
  on email_otps (email, created_at desc);

alter table email_otps enable row level security;
-- No policies: only the service role (Edge Functions) accesses this table.
