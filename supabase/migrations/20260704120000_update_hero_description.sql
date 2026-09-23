-- Update hero description text
update public.site_content
set content = 'LRSO offer a fully-managed lettings service to schools and sports clubs all over England. We handle absolutely everything, from sales & marketing, customer service, finance and bookings to professionally staffing the site with our Enhanced DBS checked Venue Supervisors.'
where key = 'home.hero.description';
