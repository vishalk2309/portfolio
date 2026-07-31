-- ============================================================
-- Blog posts. Run ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Public visitors can read only PUBLISHED posts. Logged-in (admin)
-- users can read everything (incl. drafts) and create/edit/delete.
-- ============================================================

create table if not exists blogs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,
  excerpt     text,
  content     text,                       -- markdown
  cover_image text,
  tags        text[] not null default '{}',
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists blogs_published_created_idx
  on blogs (published, created_at desc);

-- keep updated_at fresh on edits
create or replace function set_blog_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists blogs_set_updated_at on blogs;
create trigger blogs_set_updated_at
  before update on blogs
  for each row execute function set_blog_updated_at();

-- Row Level Security
alter table blogs enable row level security;

-- Public: read published posts only.
drop policy if exists "public read published blogs" on blogs;
create policy "public read published blogs" on blogs
  for select using (published = true);

-- Authenticated (admin): full read (incl. drafts) + write.
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
