-- ============================================================
-- Testimonials ("What people say"). Run ONCE in the Supabase SQL
-- Editor. Safe to re-run.
--
-- Public can read; the admin (authenticated) manages them from the
-- dashboard's Testimonials editor.
-- ============================================================

create table if not exists testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  message    text not null,
  date       text,            -- free-text label, e.g. "Jun 2025"
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table testimonials enable row level security;

drop policy if exists "public read testimonials" on testimonials;
create policy "public read testimonials" on testimonials for select using (true);

drop policy if exists "auth insert testimonials" on testimonials;
create policy "auth insert testimonials" on testimonials
  for insert to authenticated with check (true);

drop policy if exists "auth update testimonials" on testimonials;
create policy "auth update testimonials" on testimonials
  for update to authenticated using (true) with check (true);

drop policy if exists "auth delete testimonials" on testimonials;
create policy "auth delete testimonials" on testimonials
  for delete to authenticated using (true);
