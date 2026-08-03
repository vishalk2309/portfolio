-- ============================================================
-- Resources feature — downloadable files for your visitors.
-- Phase 1: FREE files (stored in the existing public "media" bucket).
-- The paid columns (is_paid / price / currency) are created now so the
-- Phase 2 Razorpay flow can slot in later without a schema change.
--
-- Additive & safe to re-run. Paste ALL of this into
-- Supabase → SQL Editor → New query → Run.
-- ============================================================

create table if not exists resources (
  id           bigint generated always as identity primary key,
  title        text,
  description  text,
  category     text,                 -- e.g. "Cheat Sheet", "Template", "Notes"
  cover_image  text,                 -- optional thumbnail (public URL)
  file_url     text,                 -- FREE download URL (public "media" bucket)
  file_name    text,                 -- friendly filename shown to the visitor
  is_paid      boolean default false,-- Phase 2
  price        numeric,              -- Phase 2 — amount in rupees (e.g. 199)
  currency     text default 'INR',   -- Phase 2
  sort_order   int,
  created_at   timestamptz default now()
);

-- ---- public read (your live site) --------------------------------
alter table resources enable row level security;

drop policy if exists "public read resources" on resources;
create policy "public read resources" on resources
  for select using (true);

-- ---- owner-only writes (your admin dashboard, when logged in) -----
drop policy if exists "auth insert resources" on resources;
create policy "auth insert resources" on resources
  for insert to authenticated with check (true);

drop policy if exists "auth update resources" on resources;
create policy "auth update resources" on resources
  for update to authenticated using (true) with check (true);

drop policy if exists "auth delete resources" on resources;
create policy "auth delete resources" on resources
  for delete to authenticated using (true);
