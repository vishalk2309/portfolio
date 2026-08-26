-- ============================================================
-- Job Update Subscribers. Run ONCE in the Supabase SQL Editor.
-- ============================================================

create table if not exists job_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  is_active   boolean not null default true
);

create index if not exists job_subscribers_email_idx
  on job_subscribers (email);

create index if not exists job_subscribers_active_idx
  on job_subscribers (is_active);

-- Row Level Security
alter table job_subscribers enable row level security;

-- Public: anyone can insert (subscribe) but only read their own
drop policy if exists "public can subscribe" on job_subscribers;
create policy "public can subscribe" on job_subscribers
  for insert with check (true);

-- Authenticated (admin): can read all and manage
drop policy if exists "auth read all job_subscribers" on job_subscribers;
create policy "auth read all job_subscribers" on job_subscribers
  for select to authenticated using (true);

drop policy if exists "auth update job_subscribers" on job_subscribers;
create policy "auth update job_subscribers" on job_subscribers
  for update to authenticated using (true) with check (true);
