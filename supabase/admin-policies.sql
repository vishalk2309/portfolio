-- ============================================================
-- Phase 3 — allow LOGGED-IN users to write (insert/update/delete).
-- Public read stays as-is (from setup.sql). Run this ONCE in the
-- Supabase SQL Editor.
--
-- After running, create your admin login:
--   Authentication → Users → Add user → enter your email + a password.
-- ============================================================

do $$
declare t text;
begin
  foreach t in array array['profile','projects','certificates','education',
                           'achievements','skills','socials','nav_links']
  loop
    -- write access for authenticated users only
    execute format('drop policy if exists "auth insert %1$s" on %1$I;', t);
    execute format('create policy "auth insert %1$s" on %1$I for insert to authenticated with check (true);', t);

    execute format('drop policy if exists "auth update %1$s" on %1$I;', t);
    execute format('create policy "auth update %1$s" on %1$I for update to authenticated using (true) with check (true);', t);

    execute format('drop policy if exists "auth delete %1$s" on %1$I;', t);
    execute format('create policy "auth delete %1$s" on %1$I for delete to authenticated using (true);', t);
  end loop;
end $$;
