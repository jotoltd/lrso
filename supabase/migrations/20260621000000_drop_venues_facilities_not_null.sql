-- The facilities column is no longer populated by the admin form.
-- Facilities now live in the separate `facilities` table.
alter table public.venues alter column facilities drop not null;
