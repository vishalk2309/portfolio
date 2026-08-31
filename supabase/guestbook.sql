-- ============================================================
-- Guestbook Table for portfolio visitor messages
-- Run ONCE in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

create table if not exists guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table guestbook enable row level security;

-- Public can insert messages
create policy "Anyone can insert messages" on guestbook
  for insert to anon, authenticated
  with check (true);

-- Public can view all messages
create policy "Anyone can view messages" on guestbook
  for select to anon, authenticated
  using (true);

-- Create index for faster queries
create index if not exists guestbook_created_at_idx on guestbook(created_at desc);

-- Grant permissions
grant select, insert on guestbook to anon, authenticated;

-- Add helpful comment
comment on table guestbook is 'Visitor messages and guestbook entries for the portfolio';
