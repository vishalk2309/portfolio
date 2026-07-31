-- ============================================================
-- Blog comment replies + identity-based likes.
-- Run ONCE in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- 1) Replies: a comment can point to a parent comment.
alter table blog_comments
  add column if not exists parent_id uuid references blog_comments(id) on delete cascade;
create index if not exists blog_comments_parent_idx on blog_comments (parent_id);

-- 2) Likes tied to a name + email so one person likes a post only once.
create table if not exists blog_likes (
  id         uuid primary key default gen_random_uuid(),
  blog_id    uuid not null references blogs(id) on delete cascade,
  name       text not null,
  email      text not null,
  created_at timestamptz not null default now(),
  unique (blog_id, email)
);
alter table blog_likes enable row level security;
-- No public policies — the RPC (service definer) records likes; admin can read.
drop policy if exists "auth read blog_likes" on blog_likes;
create policy "auth read blog_likes" on blog_likes
  for select to authenticated using (true);

-- Records a like (once per email per post) and returns the new total.
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
    return query select 0::bigint, false;
    return;
  end if;

  select count(*) into v_existing
  from blog_likes where blog_id = p_blog_id and email = v_email;

  if v_existing = 0 then
    insert into blog_likes (blog_id, name, email)
    values (p_blog_id, v_name, v_email)
    on conflict (blog_id, email) do nothing;
  end if;

  select count(*) into v_count from blog_likes where blog_id = p_blog_id;
  update blogs set likes = v_count where id = p_blog_id;

  return query select v_count, (v_existing > 0);
end; $$;

grant execute on function like_blog(uuid, text, text) to anon, authenticated;
