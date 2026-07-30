-- ============================================================
-- Portfolio — visitor analytics (total visits counter)
-- Paste into Supabase → SQL Editor → New query → Run.
-- Safe to re-run.
--
-- "Live viewers right now" uses Supabase Realtime Presence and needs
-- NO database objects — it works out of the box from the client.
-- This file only sets up the persistent TOTAL VISITS counter.
-- ============================================================

-- Single-row table holding the running total.
create table if not exists site_stats (
  id           smallint primary key default 1,
  total_visits bigint not null default 0,
  constraint site_stats_single_row check (id = 1)
);

-- Ensure the one row exists.
insert into site_stats (id, total_visits)
values (1, 0)
on conflict (id) do nothing;

-- Atomic increment. SECURITY DEFINER lets anonymous visitors bump the
-- counter through this function WITHOUT any direct write access to the
-- table — the only mutation they can perform is +1.
create or replace function increment_visits()
returns bigint
language sql
security definer
set search_path = public
as $$
  update site_stats
     set total_visits = total_visits + 1
   where id = 1
  returning total_visits;
$$;

-- Row Level Security: anyone may READ the total; nobody may write directly.
alter table site_stats enable row level security;
drop policy if exists "public read site_stats" on site_stats;
create policy "public read site_stats" on site_stats for select using (true);

-- Let the public (anon) and logged-in users call the increment function.
grant execute on function increment_visits() to anon, authenticated;
