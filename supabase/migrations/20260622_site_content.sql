create table if not exists public.site_content (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  page text not null default 'global',
  label text not null,
  content text not null default '',
  image_url text,
  updated_at timestamp with time zone default now()
);

comment on table public.site_content is 'Editable website copy and images managed through the admin CMS.';

-- Public read access
alter table public.site_content enable row level security;

-- Ensure storage bucket exists for site content images
insert into storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
values ('site-content', 'site-content', true, false, 5242880, '{image/*}')
on conflict (id) do nothing;

drop policy if exists "Allow public read access to site content" on public.site_content;
create policy "Allow public read access to site content"
  on public.site_content
  for select
  to public
  using (true);

drop policy if exists "Allow admin full access to site content" on public.site_content;
create policy "Allow admin full access to site content"
  on public.site_content
  for all
  to public
  using (true)
  with check (true);

-- Storage policies for site-content bucket
drop policy if exists "Allow public read on site-content" on storage.objects;
create policy "Allow public read on site-content"
  on storage.objects
  for select
  to public
  using (bucket_id = 'site-content');

drop policy if exists "Allow public upload on site-content" on storage.objects;
create policy "Allow public upload on site-content"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'site-content');

drop policy if exists "Allow public update on site-content" on storage.objects;
create policy "Allow public update on site-content"
  on storage.objects
  for update
  to public
  using (bucket_id = 'site-content')
  with check (bucket_id = 'site-content');

drop policy if exists "Allow public delete on site-content" on storage.objects;
create policy "Allow public delete on site-content"
  on storage.objects
  for delete
  to public
  using (bucket_id = 'site-content');

-- Insert default content
insert into public.site_content (key, page, label, content)
values
  ('home.hero.title', 'home', 'Hero title', 'School Venues for Every Community'),
  ('home.hero.subtitle', 'home', 'Hero subtitle', 'Maximising educational assets to support community wellness and local growth.'),
  ('home.hero.description', 'home', 'Hero description', 'LRSO offer a fully-managed lettings service to schools and sports clubs all over England. We handle absolutely everything, from sales & marketing, customer service, finance and bookings to professionally staffing the site with our Enhanced DBS checked Venue Supervisors.'),
  ('home.hero.cta_primary', 'home', 'Hero primary CTA', 'Browse Hire Venues'),
  ('home.hero.cta_secondary', 'home', 'Hero secondary CTA', 'Onboard My School'),
  ('home.hero.stock_1.title', 'home', 'Hero slide 1 title', 'Large Multi-Purpose School Assemblies & Events'),
  ('home.hero.stock_1.desc', 'home', 'Hero slide 1 description', 'Spacious assembly halls featuring theatrical stages, sound systems, and multi-row seating configurations ideal for worship, community events, and exams.'),
  ('home.hero.stock_2.title', 'home', 'Hero slide 2 title', 'Double-Height Multi-Sport Olympic Arenas'),
  ('home.hero.stock_2.desc', 'home', 'Hero slide 2 description', 'Professional indoor surfaces marked for basketball, netball, badminton, and futsal, complete with rebound boards and sporting gear.'),
  ('home.hero.stock_3.title', 'home', 'Hero slide 3 title', 'Premium 7-a-Side Floodlit 3G Pitches'),
  ('home.hero.stock_3.desc', 'home', 'Hero slide 3 description', 'Elite all-weather artificial turf matches under state-of-the-art stadium lighting. Optimal for league play and group training.'),
  ('home.hero.stock_4.title', 'home', 'Hero slide 4 title', 'Fast-Paced 5-a-Side Mini-Pitches'),
  ('home.hero.stock_4.desc', 'home', 'Hero slide 4 description', 'Fenced high-tempo synthetic grass cages. Perfect for casual evening kickabouts, friendly tournaments, and tactical drills.'),
  ('home.hero.stock_5.title', 'home', 'Hero slide 5 title', 'Sprung-Floor Mirrored Dance Studios'),
  ('home.hero.stock_5.desc', 'home', 'Hero slide 5 description', 'Equipped with professional sound systems, full-length mirrors, ballet barres, and temperature control for choreography and fitness.'),
  ('home.hero.stock_6.title', 'home', 'Hero slide 6 title', 'Acoustic Black-Box Drama Studios & Stages'),
  ('home.hero.stock_6.desc', 'home', 'Hero slide 6 description', 'Intimate rehearsal spaces with professional mood lighting controls, rich acoustics, and modular staging setups.'),
  ('home.hero.stock_7.title', 'home', 'Hero slide 7 title', 'Expansive Grass Rugby & Athletics Outfields'),
  ('home.hero.stock_7.desc', 'home', 'Hero slide 7 description', 'Impeccably maintained grass pitches with regulation rugby goal posts and open fields, ready for tough matches and bootcamp training.'),
  ('home.hero.stock_8.title', 'home', 'Hero slide 8 title', 'Classrooms, Meeting Rooms & Sensory Hubs'),
  ('home.hero.stock_8.desc', 'home', 'Hero slide 8 description', 'Functional meeting spaces, modern learning facilities, and specialized therapy rooms fitted with interactive whiteboards and rapid Wi-Fi.'),
  ('home.how_it_works.step1', 'home', 'How it works step 1', 'Browse our venue catalogue and find a space that fits your needs.'),
  ('home.how_it_works.step2', 'home', 'How it works step 2', 'Send an enquiry. Our team will confirm availability, pricing, and next steps.'),
  ('home.how_it_works.step3', 'home', 'How it works step 3', 'Book your confirmed slot through Bookteq and access your venue with a DBS-vetted supervisor.'),
  ('home.support.title', 'home', 'Support section title', 'Ready to Secure Your Space?'),
  ('home.support.body', 'home', 'Support section body', 'We look forward to arranging booking calendars or answering trust guidelines on Microsoft Teams. Feel free to contact Crawley staff directly!'),
  ('home.support.cta_primary', 'home', 'Support primary CTA', 'Send an Enquiry'),
  ('home.support.cta_secondary', 'home', 'Support secondary CTA', 'Contact Support HQ'),
  ('partnership.header.title', 'partnership', 'Partnership header title', 'In Partnership with Schools and Sports Clubs'),
  ('partnership.header.lead', 'partnership', 'Partnership header lead', 'LRSO generate significant and much-needed revenue for schools and sports clubs through the sales and management of their facilities for community use.'),
  ('partnership.header.body', 'partnership', 'Partnership header body', 'We handle absolutely all aspects of the lettings process, from customer service, sales & marketing, bookings and finance through to the safe and professional supervision of all lettings by our highly trained Venue Supervisors.'),
  ('contact.page.title', 'contact', 'Contact page title', 'Contact & Support'),
  ('contact.page.subtitle', 'contact', 'Contact page subtitle', 'Our team is here to help with venue enquiries, partnership questions, and account support.'),
  ('contact.address', 'contact', 'Contact address', 'LRSO Ltd, Unit 8, Amberley Court,\nWhitworth Road, Crawley, West Sussex,\nRH11 7XL'),
  ('footer.company_name', 'footer', 'Footer company name', 'LRSO Ltd'),
  ('footer.email', 'footer', 'Footer email', 'enquiries@lrso.co.uk'),
  ('footer.phone', 'footer', 'Footer phone', '03333 355 944'),
  ('footer.address', 'footer', 'Footer address', 'Unit 8, Amberley Court,\nWhitworth Road, Crawley,\nWest Sussex, RH11 7XL'),
  ('footer.mission', 'footer', 'Footer mission', 'Connecting the people who want to Do with the schools that have the facilities to allow the Doing. Maintenance of healthy mind & bodies through local community activity.'),
  ('footer.tagline', 'footer', 'Footer tagline', 'Generating Money for Schools, Sports Clubs and Community Facilities. Registered office: Unit 8 Amberley Court, Crawley.')
on conflict (key) do update set content = excluded.content;
