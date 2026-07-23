-- ============================================================
-- Image uploads — creates a PUBLIC storage bucket named "media"
-- and the access policies for it. Run ONCE in the Supabase SQL Editor.
--
-- After this: logged-in users can upload/replace/delete files, and
-- anyone can view them (needed so the images show on your portfolio).
-- ============================================================

-- 1) the bucket (public = files are viewable by URL without a login)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- 2) policies on the files themselves
drop policy if exists "public read media"  on storage.objects;
drop policy if exists "auth upload media"  on storage.objects;
drop policy if exists "auth update media"  on storage.objects;
drop policy if exists "auth delete media"  on storage.objects;

create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');

create policy "auth upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

create policy "auth update media" on storage.objects
  for update to authenticated using (bucket_id = 'media');

create policy "auth delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
