-- Admin users table for user management
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  email text,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.admin_users enable row level security;

-- Policies for admin users
create policy "Anon can read admin users"
  on public.admin_users for select
  using (true);

create policy "Anon can insert admin users"
  on public.admin_users for insert
  with check (true);

create policy "Anon can update admin users"
  on public.admin_users for update
  using (true);

create policy "Anon can delete admin users"
  on public.admin_users for delete
  using (true);

-- Insert existing admin users (passwords should be hashed in production)
insert into public.admin_users (username, password, email, name) values
  ('admin', 'admin123', 'admin@lrso.co.uk', 'Admin User'),
  ('Josh', 'R1l3yj014!', 'josh@lrso.co.uk', 'Josh')
on conflict (username) do nothing;
