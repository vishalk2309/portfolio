-- ============================================================
-- LeetCode stats cache (optional) for the leetcode-stats edge function.
--
-- Paste into Supabase → SQL Editor → Run. Idempotent (safe to re-run).
-- Already included in setup-features.sql — this standalone file is for
-- adding just the cache to an existing setup.
--
-- The edge function works WITHOUT this table (it falls back to a live
-- fetch every call); the table simply makes repeat requests instant and
-- keeps us from hammering LeetCode.
-- ============================================================

create table if not exists leetcode_cache (
  username   text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table leetcode_cache enable row level security;
-- No policies: only the Edge Function (service role) touches this table.
