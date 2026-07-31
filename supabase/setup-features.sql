-- ============================================================
-- ONE-SHOT SETUP for the features added this round:
--   • Visitor analytics (total visits counter)
--   • Profile quote + About summary columns
--   • Blog (posts, public submissions, author fields)
--   • Request-a-Project (requests + email OTP verification)
--
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Everything is idempotent (safe to run more than once).
--
-- Assumes the base schema (profile, projects, …), admin-policies.sql
-- and storage.sql have already been run — your site already uses them.
-- ============================================================


-- ------------------------------------------------------------
-- 1) Visitor analytics — running total of visits
-- ------------------------------------------------------------
create table if not exists site_stats (
  id           smallint primary key default 1,
  total_visits bigint not null default 0,
  constraint site_stats_single_row check (id = 1)
);
insert into site_stats (id, total_visits) values (1, 0)
  on conflict (id) do nothing;

create or replace function increment_visits()
returns bigint language sql security definer set search_path = public as $$
  update site_stats set total_visits = total_visits + 1 where id = 1
  returning total_visits;
$$;

alter table site_stats enable row level security;
drop policy if exists "public read site_stats" on site_stats;
create policy "public read site_stats" on site_stats for select using (true);
grant execute on function increment_visits() to anon, authenticated;


-- ------------------------------------------------------------
-- 2) Profile — home quote + About summary (editable in admin)
-- ------------------------------------------------------------
alter table profile add column if not exists quote        text;
alter table profile add column if not exists quote_author text;
alter table profile add column if not exists summary      text;


-- ------------------------------------------------------------
-- 3) Blog posts (+ public submission author fields)
-- ------------------------------------------------------------
create table if not exists blogs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,
  excerpt     text,
  content     text,
  cover_image text,
  tags        text[] not null default '{}',
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table blogs add column if not exists author_name  text;
alter table blogs add column if not exists author_email text;
alter table blogs add column if not exists author_date  date;
alter table blogs add column if not exists likes        bigint not null default 0;

-- Public like counter — ±1 on published posts only.
create or replace function bump_blog_likes(p_id uuid, p_delta int)
returns bigint language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  update blogs
     set likes = greatest(0, likes + case when p_delta >= 0 then 1 else -1 end)
   where id = p_id and published = true
   returning likes into v;
  return coalesce(v, 0);
end; $$;
grant execute on function bump_blog_likes(uuid, int) to anon, authenticated;

create index if not exists blogs_published_created_idx
  on blogs (published, created_at desc);

create or replace function set_blog_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists blogs_set_updated_at on blogs;
create trigger blogs_set_updated_at before update on blogs
  for each row execute function set_blog_updated_at();

alter table blogs enable row level security;

drop policy if exists "public read published blogs" on blogs;
create policy "public read published blogs" on blogs
  for select using (published = true);

drop policy if exists "auth read all blogs" on blogs;
create policy "auth read all blogs" on blogs
  for select to authenticated using (true);

drop policy if exists "auth insert blogs" on blogs;
create policy "auth insert blogs" on blogs
  for insert to authenticated with check (true);

drop policy if exists "auth update blogs" on blogs;
create policy "auth update blogs" on blogs
  for update to authenticated using (true) with check (true);

drop policy if exists "auth delete blogs" on blogs;
create policy "auth delete blogs" on blogs
  for delete to authenticated using (true);


-- ------------------------------------------------------------
-- 4) Request-a-Project — submissions + email OTP codes
-- ------------------------------------------------------------
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

-- Email verification codes — used by BOTH the project form and blog submissions.
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
create index if not exists email_otps_email_idx on email_otps (email, created_at desc);
alter table email_otps enable row level security;
-- No policies: only the Edge Functions (service role) touch this table.
