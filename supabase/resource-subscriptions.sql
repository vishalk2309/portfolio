-- Create resource_subscriptions table
create table resource_subscriptions (
  id bigserial primary key,
  email text not null unique,
  subscribed_at timestamp with time zone default now(),
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add indexes for better query performance
create index resource_subscriptions_email_idx on resource_subscriptions(email);
create index resource_subscriptions_is_active_idx on resource_subscriptions(is_active);

-- Enable RLS
alter table resource_subscriptions enable row level security;

-- Anyone can insert (subscribe)
create policy "Anyone can subscribe to resources"
  on resource_subscriptions
  for insert
  with check (true);

-- Allow select for authenticated users (for admin dashboard)
create policy "Authenticated users can view subscriptions"
  on resource_subscriptions
  for select
  using (auth.role() = 'authenticated');

-- Allow update for authenticated users (for admin dashboard)
create policy "Authenticated users can update subscriptions"
  on resource_subscriptions
  for update
  using (auth.role() = 'authenticated');

-- Allow delete for authenticated users (for admin dashboard)
create policy "Authenticated users can delete subscriptions"
  on resource_subscriptions
  for delete
  using (auth.role() = 'authenticated');

-- Create a trigger to update the updated_at timestamp
create or replace function update_resource_subscriptions_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_resource_subscriptions_timestamp
  before update on resource_subscriptions
  for each row
  execute function update_resource_subscriptions_timestamp();
