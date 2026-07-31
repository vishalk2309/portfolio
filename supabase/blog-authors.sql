-- ============================================================
-- Adds author fields to blogs so visitors can submit posts.
-- Run ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Public submissions are inserted by the submit-blog Edge Function
-- (service role) as unpublished drafts — the admin publishes them.
-- ============================================================

alter table blogs add column if not exists author_name  text;
alter table blogs add column if not exists author_email text;
alter table blogs add column if not exists author_date  date;
