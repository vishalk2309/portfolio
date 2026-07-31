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
alter table blogs add column if not exists author_name     text;
alter table blogs add column if not exists author_email    text;
alter table blogs add column if not exists author_date     date;
alter table blogs add column if not exists author_linkedin text;
alter table blogs add column if not exists likes           bigint not null default 0;
alter table blogs add column if not exists status          text not null default 'submitted';
update blogs set status = 'published' where published = true and status <> 'published';

-- Submission status lookup (contributors track by id).
create or replace function blog_submission_status(p_id uuid)
returns table (status text, title text, slug text, published boolean)
language sql security definer set search_path = public as $$
  select b.status, b.title, b.slug, b.published from blogs b where b.id = p_id;
$$;
grant execute on function blog_submission_status(uuid) to anon, authenticated;

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


-- Blog comments (+ replies via parent_id)
create table if not exists blog_comments (
  id         uuid primary key default gen_random_uuid(),
  blog_id    uuid not null references blogs(id) on delete cascade,
  name       text not null,
  body       text not null,
  approved   boolean not null default true,
  created_at timestamptz not null default now()
);
alter table blog_comments
  add column if not exists parent_id uuid references blog_comments(id) on delete cascade;
alter table blog_comments add column if not exists email text;
create index if not exists blog_comments_blog_idx on blog_comments (blog_id, created_at);
create index if not exists blog_comments_parent_idx on blog_comments (parent_id);

-- Identity-based post likes (one per email).
create table if not exists blog_likes (
  id         uuid primary key default gen_random_uuid(),
  blog_id    uuid not null references blogs(id) on delete cascade,
  name       text not null,
  email      text not null,
  created_at timestamptz not null default now(),
  unique (blog_id, email)
);
alter table blog_likes enable row level security;
drop policy if exists "auth read blog_likes" on blog_likes;
create policy "auth read blog_likes" on blog_likes for select to authenticated using (true);

create or replace function like_blog(p_blog_id uuid, p_name text, p_email text)
returns table (likes bigint, already_liked boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(p_email));
  v_name  text := nullif(trim(p_name), '');
  v_existing int;
  v_count bigint;
begin
  if v_name is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'name and a valid email are required';
  end if;
  if not exists (select 1 from blogs where id = p_blog_id and published = true) then
    return query select 0::bigint, false; return;
  end if;
  select count(*) into v_existing from blog_likes where blog_id = p_blog_id and email = v_email;
  if v_existing = 0 then
    insert into blog_likes (blog_id, name, email) values (p_blog_id, v_name, v_email)
    on conflict (blog_id, email) do nothing;
  end if;
  select count(*) into v_count from blog_likes where blog_id = p_blog_id;
  update blogs set likes = v_count where id = p_blog_id;
  return query select v_count, (v_existing > 0);
end; $$;
grant execute on function like_blog(uuid, text, text) to anon, authenticated;

create or replace function unlike_blog(p_blog_id uuid, p_email text)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_count bigint;
begin
  delete from blog_likes where blog_id = p_blog_id and email = lower(trim(p_email));
  select count(*) into v_count from blog_likes where blog_id = p_blog_id;
  update blogs set likes = v_count where id = p_blog_id;
  return v_count;
end; $$;
grant execute on function unlike_blog(uuid, text) to anon, authenticated;
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


-- Blog subscribers (newsletter)
create table if not exists blog_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);
alter table blog_subscribers enable row level security;
drop policy if exists "auth read blog_subscribers" on blog_subscribers;
create policy "auth read blog_subscribers" on blog_subscribers
  for select to authenticated using (true);
alter table blogs add column if not exists subscribers_notified boolean not null default false;


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
