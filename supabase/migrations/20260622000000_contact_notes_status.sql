-- Add status and notes columns to contacts table for admin reply tracking
alter table public.contacts add column if not exists status text not null default 'open' check (status in ('open','replied','closed'));
alter table public.contacts add column if not exists notes text;
