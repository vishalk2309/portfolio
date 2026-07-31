-- ============================================================
-- Blog submission status tracking. Run ONCE in the Supabase SQL
-- Editor. Safe to re-run.
--
-- status: 'submitted' | 'in_review' | 'published' | 'rejected'
-- Contributors look up their submission by id via a SECURITY DEFINER
-- RPC (so they see only that row's status — nothing else).
-- ============================================================

alter table blogs add column if not exists status text not null default 'submitted';

-- Existing published posts should read as 'published'.
update blogs set status = 'published' where published = true and status <> 'published';

create or replace function blog_submission_status(p_id uuid)
returns table (status text, title text, slug text, published boolean)
language sql
security definer
set search_path = public
as $$
  select b.status, b.title, b.slug, b.published
  from blogs b
  where b.id = p_id;
$$;

grant execute on function blog_submission_status(uuid) to anon, authenticated;
