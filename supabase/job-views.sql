-- ============================================================
-- Job update views. Run ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Visitors can't write to job_updates directly (RLS). This RPC bumps the
-- view counter by 1 on a PUBLISHED job post and returns the new total.
-- The client calls it at most once per browser session per post.
-- ============================================================

alter table job_updates add column if not exists views bigint not null default 0;

create or replace function bump_job_views(p_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v bigint;
begin
  update job_updates
     set views = views + 1
   where id = p_id and published = true
   returning views into v;
  return coalesce(v, 0);
end; $$;

grant execute on function bump_job_views(uuid) to anon, authenticated;
