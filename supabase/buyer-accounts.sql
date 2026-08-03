-- ============================================================
-- Phase 2.5 — Buyer accounts + purchase library, and LOCK DOWN admin writes.
-- Paste ALL of this into Supabase → SQL Editor → New query → Run.
-- Safe to re-run.
--
-- Why the lockdown matters: once visitors can sign up, EVERY signed-in user is
-- "authenticated". The old write policies granted write access to ALL
-- authenticated users — so a buyer could edit your content via the API. We
-- replace that with an is_owner() check so only YOU can write.
-- ============================================================

-- >>> CHANGE THIS if your Supabase admin login uses a different email <<<
-- It MUST match the email of the user you created in Authentication → Users.
create or replace function is_owner() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'kushwahavishal296@zohomail.com'
$$;

-- ---- 1) purchases: tie each purchase to the buyer's account ----------------
alter table purchases add column if not exists user_id uuid references auth.users(id);

-- Buyers can read THEIR OWN purchases; the owner can read all. Inserts still
-- happen only from the verify-payment Edge Function (service role → bypasses RLS).
drop policy if exists "read own purchases" on purchases;
create policy "read own purchases" on purchases
  for select to authenticated
  using (user_id = auth.uid() or is_owner());

-- ---- 2) lock CONTENT writes to the owner only ------------------------------
-- Rebuild the write policies from admin-policies.sql, but owner-gated.
do $$
declare t text;
begin
  foreach t in array array['profile','projects','certificates','education',
                           'achievements','skills','socials','nav_links',
                           'resources']
  loop
    execute format('drop policy if exists "auth insert %1$s" on %1$I;', t);
    execute format('drop policy if exists "auth update %1$s" on %1$I;', t);
    execute format('drop policy if exists "auth delete %1$s" on %1$I;', t);

    execute format('create policy "owner insert %1$s" on %1$I for insert to authenticated with check (is_owner());', t);
    execute format('create policy "owner update %1$s" on %1$I for update to authenticated using (is_owner()) with check (is_owner());', t);
    execute format('create policy "owner delete %1$s" on %1$I for delete to authenticated using (is_owner());', t);
  end loop;
end $$;

-- ---- 3) lock STORAGE writes to the owner too -------------------------------
-- media (images + free files) and paid-resources should only be written by you.
drop policy if exists "auth upload media" on storage.objects;
drop policy if exists "auth update media" on storage.objects;
drop policy if exists "auth delete media" on storage.objects;
create policy "owner write media" on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and is_owner())
  with check (bucket_id = 'media' and is_owner());

drop policy if exists "auth manage paid" on storage.objects;
create policy "owner manage paid" on storage.objects
  for all to authenticated
  using (bucket_id = 'paid-resources' and is_owner())
  with check (bucket_id = 'paid-resources' and is_owner());

-- NOTE: enable email signups in Authentication → Providers → Email
-- (Supabase enables this by default). Email OTP works out of the box.
