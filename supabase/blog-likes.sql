-- ============================================================
-- Blog likes. Run ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Visitors can't write to blogs directly (RLS). This RPC bumps the
-- like counter by exactly ±1 on a PUBLISHED post and returns the new
-- total — the only mutation the public can make.
-- ============================================================

alter table blogs add column if not exists likes bigint not null default 0;

create or replace function bump_blog_likes(p_id uuid, p_delta int)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v bigint;
begin
  update blogs
     set likes = greatest(0, likes + case when p_delta >= 0 then 1 else -1 end)
   where id = p_id and published = true
   returning likes into v;
  return coalesce(v, 0);
end; $$;

grant execute on function bump_blog_likes(uuid, int) to anon, authenticated;
