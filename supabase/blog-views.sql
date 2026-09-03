-- ============================================================
-- Blog views. Run ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Visitors can't write to blogs directly (RLS). This RPC bumps the
-- view counter by 1 on a PUBLISHED post and returns the new total.
-- The client calls it at most once per browser session per post.
-- ============================================================

alter table blogs add column if not exists views bigint not null default 0;

create or replace function bump_blog_views(p_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v bigint;
begin
  update blogs
     set views = views + 1
   where id = p_id and published = true
   returning views into v;
  return coalesce(v, 0);
end; $$;

grant execute on function bump_blog_views(uuid) to anon, authenticated;
