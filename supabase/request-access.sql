-- ============================================================
-- Phase 3 — REQUEST-ONLY resources: a third access tier alongside
-- free and paid. The visitor asks for access, YOU approve, and only
-- then can they download.
--
-- Paste ALL of this into Supabase → SQL Editor → New query → Run.
-- Safe to re-run.
--
-- PREREQUISITE: run buyer-accounts.sql first — it defines is_owner(),
-- which the policies below use to tell you apart from ordinary buyers.
--
-- Like paid files, request-only files must NEVER be publicly downloadable,
-- so they live in the private "paid-resources" bucket (set `file_path`,
-- leave `file_url` blank) and are only ever served as short-lived signed
-- URLs by the get-download function after it confirms an approval.
-- ============================================================

-- ---- 1) resources: one column describes the access tier -------------------
-- 'free' | 'paid' | 'request'. `is_paid` is kept in sync for the existing
-- payment code paths, so nothing that reads it breaks.
--
-- Deliberately NO column default: the trigger below needs to tell "the caller
-- didn't set this" apart from "the caller chose free". With a 'free' default,
--   insert into resources (title, is_paid) values ('X', true)
-- would look like an explicit choice of free and quietly flip is_paid back off.
alter table resources add column if not exists access_type text;
alter table resources alter column access_type drop default;

-- Backfill from the old boolean for rows created before this column existed.
update resources
   set access_type = case when is_paid then 'paid' else 'free' end
 where access_type is null;

alter table resources
  drop constraint if exists resources_access_type_check;
alter table resources
  add constraint resources_access_type_check
  check (access_type in ('free', 'paid', 'request'));

-- `access_type` and `is_paid` describe the same thing, and older code paths
-- (create-order, the admin's "Paid resource?" checkbox) still read the boolean.
-- This trigger makes them impossible to desync no matter which one gets
-- written, from the dashboard or straight from the SQL editor.
create or replace function sync_resource_access() returns trigger
language plpgsql as $$
begin
  -- The dashboard's dropdown has a blank "—" option, so an untouched form sends
  -- ''. Normalise it to NULL = "not specified" (and keep the CHECK below happy —
  -- BEFORE triggers run before constraints are evaluated).
  if new.access_type = '' then
    new.access_type := null;
  end if;

  if tg_op = 'INSERT' then
    if new.access_type is null then
      new.access_type := case when new.is_paid then 'paid' else 'free' end;
    else
      new.is_paid := (new.access_type = 'paid');
    end if;
    return new;
  end if;

  -- UPDATE. A blank dropdown means "leave it alone", never "downgrade to free"
  -- — otherwise saving an unrelated edit could quietly un-gate a resource.
  new.access_type := coalesce(
    new.access_type,
    old.access_type,
    case when new.is_paid then 'paid' else 'free' end
  );

  if new.access_type is distinct from old.access_type then
    new.is_paid := (new.access_type = 'paid');       -- tier changed
  elsif new.is_paid is distinct from old.is_paid then
    new.access_type := case when new.is_paid then 'paid' else 'free' end;
  end if;
  return new;
end $$;

drop trigger if exists resources_sync_access on resources;
create trigger resources_sync_access
  before insert or update on resources
  for each row execute function sync_resource_access();

-- ---- 2) the request log ---------------------------------------------------
create table if not exists access_requests (
  id           bigint generated always as identity primary key,
  resource_id  bigint references resources(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete cascade,
  email        text,
  name         text,
  reason       text,                       -- why they need it (their words)
  status       text not null default 'pending', -- pending | approved | declined
  note         text,                       -- your message on the decision
  created_at   timestamptz default now(),
  decided_at   timestamptz
);

alter table access_requests
  drop constraint if exists access_requests_status_check;
alter table access_requests
  add constraint access_requests_status_check
  check (status in ('pending', 'approved', 'declined'));

-- One request row per person per resource. The request-access function upserts
-- onto this, so asking again after a decline reuses the row (and re-opens it)
-- instead of piling up duplicates.
create unique index if not exists access_requests_user_resource_idx
  on access_requests (user_id, resource_id);

-- Speeds up the dashboard's "pending first, newest first" listing.
create index if not exists access_requests_status_idx
  on access_requests (status, created_at desc);

-- ---- 3) RLS -------------------------------------------------------------
alter table access_requests enable row level security;

-- Requesters read THEIR OWN rows (so the resources page can show "pending"
-- or "approved"); you read all of them.
drop policy if exists "read own access_requests" on access_requests;
create policy "read own access_requests" on access_requests
  for select to authenticated
  using (user_id = auth.uid() or is_owner());

-- Deliberately NO insert or update policy. Requests are created by the
-- request-access Edge Function and decided by the decide-access Edge
-- Function, both of which run as the service role (bypassing RLS). If
-- visitors could insert or update directly they could simply write
-- status = 'approved' for themselves.
