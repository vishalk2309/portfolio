-- ============================================================
-- Blog subscribers (email newsletter). Run ONCE in the Supabase
-- SQL Editor. Safe to re-run.
--
-- Emails are added via the subscribe-blog Edge Function (service role).
-- The admin can read the list. `subscribers_notified` on blogs makes the
-- "new post" broadcast fire only once per post.
-- ============================================================

create table if not exists blog_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

alter table blog_subscribers enable row level security;
drop policy if exists "auth read blog_subscribers" on blog_subscribers;
create policy "auth read blog_subscribers" on blog_subscribers
  for select to authenticated using (true);
-- No public policies — inserts happen through the Edge Function.

alter table blogs add column if not exists subscribers_notified boolean not null default false;
