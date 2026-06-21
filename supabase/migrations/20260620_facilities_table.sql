-- Make old facilities column nullable (replaced by separate facilities table)
alter table public.venues alter column facilities drop not null;

-- Separate facilities table with per-facility images
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

alter table public.facilities enable row level security;

create policy "Public can read facilities"
  on public.facilities for select using (true);

create policy "Anon can insert facilities"
  on public.facilities for insert with check (true);

create policy "Anon can update facilities"
  on public.facilities for update using (true);

create policy "Anon can delete facilities"
  on public.facilities for delete using (true);

-- Storage bucket for facility images
insert into storage.buckets (id, name, public)
values ('facility-images', 'facility-images', true)
on conflict (id) do nothing;

create policy "Public can read facility images"
  on storage.objects for select
  using (bucket_id = 'facility-images');

create policy "Anon can upload facility images"
  on storage.objects for insert
  with check (bucket_id = 'facility-images');

create policy "Anon can delete facility images"
  on storage.objects for delete
  using (bucket_id = 'facility-images');
