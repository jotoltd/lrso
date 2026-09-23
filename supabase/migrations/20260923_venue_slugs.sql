-- Permanent slug URLs for venues, e.g. /venues/city-of-london-academy-southwark

alter table public.venues add column if not exists slug text;

-- Backfill existing venues from their name (append -2, -3, ... on collisions)
with base as (
  select
    id,
    created_at,
    trim(both '-' from lower(regexp_replace(regexp_replace(name, '[''’]', '', 'g'), '[^a-zA-Z0-9]+', '-', 'g'))) as s
  from public.venues
),
ranked as (
  select id, s, row_number() over (partition by s order by created_at) as rn
  from base
)
update public.venues v
set slug = r.s || case when r.rn = 1 then '' else '-' || r.rn end
from ranked r
where v.id = r.id
  and (v.slug is null or v.slug = '');

create unique index if not exists venues_slug_key on public.venues (slug);

-- Auto-generate slug from name when missing (inserts from admin panel, scripts, SQL).
-- Existing slugs are left untouched so URLs stay permanent across renames.
create or replace function public.set_venue_slug() returns trigger as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := trim(both '-' from lower(regexp_replace(regexp_replace(new.name, '[''’]', '', 'g'), '[^a-zA-Z0-9]+', '-', 'g')));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists venues_set_slug on public.venues;
create trigger venues_set_slug
  before insert or update on public.venues
  for each row execute function public.set_venue_slug();
