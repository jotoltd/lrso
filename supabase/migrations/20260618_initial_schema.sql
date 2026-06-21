-- Venues table
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  facilities text not null,
  book_link text not null,
  created_at timestamptz default now()
);

-- Enquiries table
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  venue text not null,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- Contact submissions table
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.venues enable row level security;
alter table public.enquiries enable row level security;
alter table public.contacts enable row level security;

-- Public read for venues (so the site can display them)
create policy "Public can read venues"
  on public.venues for select
  using (true);

-- Allow insert for enquiries and contacts (public form submissions)
create policy "Public can insert enquiries"
  on public.enquiries for insert
  with check (true);

create policy "Public can insert contacts"
  on public.contacts for insert
  with check (true);

-- Service role can do everything (admin dashboard uses anon key + RLS bypass via service role)
-- For now allow anon to read all for admin (swap to auth-based later)
create policy "Anon can read enquiries"
  on public.enquiries for select
  using (true);

create policy "Anon can update enquiries"
  on public.enquiries for update
  using (true);

create policy "Anon can read contacts"
  on public.contacts for select
  using (true);

create policy "Anon can update contacts"
  on public.contacts for update
  using (true);

create policy "Anon can insert venues"
  on public.venues for insert
  with check (true);

create policy "Anon can delete venues"
  on public.venues for delete
  using (true);

create policy "Anon can update venues"
  on public.venues for update
  using (true);
