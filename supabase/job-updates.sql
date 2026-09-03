-- ============================================================
-- Job Updates. Run ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Public visitors can read only PUBLISHED updates. Logged-in (admin)
-- users can read everything (incl. drafts) and create/edit/delete.
-- ============================================================

create table if not exists job_updates (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,
  description text,                      -- short teaser
  content     text,                       -- markdown
  company     text,                       -- company name
  position    text,                       -- job title
  location    text,                       -- job location
  job_type    text,                       -- Full-time, Part-time, Internship, Apprenticeship, Contract
  work_mode   text,                       -- Remote, Hybrid, On-site
  batch       text,                       -- batch / cohort identifier
  job_id      text,                       -- job identifier/reference
  experience  text,                       -- required experience (e.g., "3-5 years")
  qualification text,                    -- required qualification (e.g., "Bachelor's in CS")
  apply_url   text,                       -- URL to apply for the job
  start_date  date,                       -- when they started
  end_date    date,                       -- when they left (if applicable)
  cover_image text,                       -- featured image
  tags        text[] not null default '{}', -- tech stack, skills, etc.
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists job_updates_published_created_idx
  on job_updates (published, created_at desc);

-- keep updated_at fresh on edits
create or replace function set_job_updates_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists job_updates_set_updated_at on job_updates;
create trigger job_updates_set_updated_at
  before update on job_updates
  for each row execute function set_job_updates_updated_at();

-- Row Level Security
alter table job_updates enable row level security;

-- Public: read published updates only.
drop policy if exists "public read published job_updates" on job_updates;
create policy "public read published job_updates" on job_updates
  for select using (published = true);

-- Authenticated (admin): full read (incl. drafts) + write.
drop policy if exists "auth read all job_updates" on job_updates;
create policy "auth read all job_updates" on job_updates
  for select to authenticated using (true);

drop policy if exists "auth insert job_updates" on job_updates;
create policy "auth insert job_updates" on job_updates
  for insert to authenticated with check (true);

drop policy if exists "auth update job_updates" on job_updates;
create policy "auth update job_updates" on job_updates
  for update to authenticated using (true) with check (true);

drop policy if exists "auth delete job_updates" on job_updates;
create policy "auth delete job_updates" on job_updates
  for delete to authenticated using (true);
