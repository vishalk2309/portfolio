-- ============================================================
-- Adds the home-page quote + About summary fields to the profile
-- table so they can be edited from the admin dashboard. Run ONCE
-- in the Supabase SQL Editor. Safe to re-run.
--
-- Until you run this, the site simply uses the defaults in
-- src/data.js — nothing breaks either way.
-- ============================================================

alter table profile add column if not exists quote        text;
alter table profile add column if not exists quote_author text;
alter table profile add column if not exists summary      text;
