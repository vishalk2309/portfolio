-- ============================================================
-- Blog comments. Run ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Public can READ approved comments. Inserts go through the
-- submit-comment Edge Function (service role). The admin can read all
-- and delete (moderation).
-- ============================================================

create table if not exists blog_comments (
  id         uuid primary key default gen_random_uuid(),
  blog_id    uuid not null references blogs(id) on delete cascade,
  name       text not null,
  body       text not null,
  approved   boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists blog_comments_blog_idx
  on blog_comments (blog_id, created_at);

alter table blog_comments enable row level security;

drop policy if exists "public read approved comments" on blog_comments;
create policy "public read approved comments" on blog_comments
  for select using (approved = true);

drop policy if exists "auth read all comments" on blog_comments;
create policy "auth read all comments" on blog_comments
  for select to authenticated using (true);

drop policy if exists "auth update comments" on blog_comments;
create policy "auth update comments" on blog_comments
  for update to authenticated using (true) with check (true);

drop policy if exists "auth delete comments" on blog_comments;
create policy "auth delete comments" on blog_comments
  for delete to authenticated using (true);
