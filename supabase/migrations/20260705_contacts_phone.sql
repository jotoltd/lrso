-- Add phone column to contacts table
alter table public.contacts add column if not exists phone text;
