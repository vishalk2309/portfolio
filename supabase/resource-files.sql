-- ============================================================
-- Resource folders — let one resource hold MANY files.
-- Paste ALL of this into Supabase → SQL Editor → New query → Run.
-- Safe to re-run. Requires resources + is_owner() to already exist
-- (from resources.sql, paid-resources.sql, buyer-accounts.sql).
-- ============================================================

create table if not exists resource_files (
  id           bigint generated always as identity primary key,
  resource_id  bigint references resources(id) on delete cascade,
  label        text,     -- shown to the visitor (e.g. "Chapter 1 – Basics")
  file_url     text,     -- FREE file: public "media" URL
  file_path    text,     -- PAID file: private "paid-resources" path
  sort_order   int,
  created_at   timestamptz default now()
);

-- Public can read the list (labels/ids). Knowing a private file_path grants
-- nothing on its own — the bucket is private and downloads still require a
-- signed URL minted by get-download after an ownership check.
alter table resource_files enable row level security;

drop policy if exists "public read resource_files" on resource_files;
create policy "public read resource_files" on resource_files
  for select using (true);

drop policy if exists "owner insert resource_files" on resource_files;
create policy "owner insert resource_files" on resource_files
  for insert to authenticated with check (is_owner());

drop policy if exists "owner update resource_files" on resource_files;
create policy "owner update resource_files" on resource_files
  for update to authenticated using (is_owner()) with check (is_owner());

drop policy if exists "owner delete resource_files" on resource_files;
create policy "owner delete resource_files" on resource_files
  for delete to authenticated using (is_owner());
