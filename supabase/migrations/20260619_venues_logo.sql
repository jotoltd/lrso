-- Add logo_url column to venues
alter table public.venues add column if not exists logo_url text;

-- Create storage bucket for venue logos
insert into storage.buckets (id, name, public)
values ('venue-logos', 'venue-logos', true)
on conflict (id) do nothing;

-- Allow public read on venue-logos bucket
create policy "Public can read venue logos"
  on storage.objects for select
  using (bucket_id = 'venue-logos');

-- Allow anon to upload venue logos
create policy "Anon can upload venue logos"
  on storage.objects for insert
  with check (bucket_id = 'venue-logos');

-- Allow anon to delete venue logos
create policy "Anon can delete venue logos"
  on storage.objects for delete
  using (bucket_id = 'venue-logos');
