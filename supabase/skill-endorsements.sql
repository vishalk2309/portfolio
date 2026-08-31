-- ============================================================
-- Skill Endorsements Table - Track visitor endorsements
-- Run ONCE in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

create table if not exists skill_endorsements (
  id uuid primary key default gen_random_uuid(),
  skill text not null,
  visitor_id text not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table skill_endorsements enable row level security;

-- Public can insert endorsements
create policy "Anyone can insert endorsements" on skill_endorsements
  for insert to anon, authenticated
  with check (true);

-- Public can view endorsements
create policy "Anyone can view endorsements" on skill_endorsements
  for select to anon, authenticated
  using (true);

-- Create index for faster queries
create index if not exists skill_endorsements_skill_idx on skill_endorsements(skill);
create index if not exists skill_endorsements_visitor_idx on skill_endorsements(visitor_id);
create index if not exists skill_endorsements_created_idx on skill_endorsements(created_at desc);

-- Grant permissions
grant select, insert on skill_endorsements to anon, authenticated;

-- Add helpful comment
comment on table skill_endorsements is 'Tracks visitor endorsements for portfolio skills';
