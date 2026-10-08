-- Fix misassigned Bookteq booking links (verified against each widget's rendered venue title)
update public.venues set book_link = 'https://widget.bookteq.com/lrso/book-online/9cae0a8d-ca48-4822-b604-3c1f387a9a2b' where name = 'Bluecoat Trent Academy';
update public.venues set book_link = 'https://widget.bookteq.com/lrso/book-online/eaf0e5ac-6b64-4a0d-90de-a268954f8238' where name = 'Wallington County Grammar School';
update public.venues set book_link = 'https://widget.bookteq.com/lrso/book-online/0d4bd2a4-8b01-412e-a9ee-0a68aadf45d0' where name = 'Woodbridge Road Academy';
update public.venues set book_link = 'https://widget.bookteq.com/lrso/book-online/e7ab6b2e-1a83-4dd8-95f4-6b87f9517cb9' where name = 'Piper''s Vale Academy';

-- Clean stray HTML junk appended to booking URLs by scraping
update public.venues
set book_link = 'https://widget.bookteq.com/lrso/book-online/' || substring(book_link from 'book-online/([0-9a-f-]{36})') || '?source=venue-widget'
where book_link like '%book-online/%' and book_link like '%iframe%';

-- Shirley High School: name facilities and add descriptions.
-- The row at sort_order 2 was a photo of the school front, not a facility — remove it.
delete from public.facilities where id = '2512897d-fc66-49d5-a90f-cd3ee83e015a';

update public.facilities set name = 'Boxing Ring', description = 'A rarity for schools these days, Shirley High have a full-size boxing ring available to hire for sparring and training.', sort_order = 0 where id = '4836e817-75a6-4d0c-95ff-de93249627c6';
update public.facilities set name = 'Gymnasium', description = 'This is the perfect facility for all manner of keep fit, martial arts and group exercises.', sort_order = 1 where id = '9413d1c4-f671-4d65-8e97-f7d0c55c5e16';
update public.facilities set name = 'Dining Hall', description = 'This functional dining hall is perfect for all types of gathering where eating and drinking is required. With bench seating, the Dining Hall can seat 120 people.', sort_order = 2 where id = '423bdc0f-19ce-47b9-a029-d31b2f66614c';
update public.facilities set name = 'Main Hall', description = 'A classic school assembly hall complete with stage and AV for all kinds of social event or performance.', sort_order = 3 where id = '8fcfb056-78ea-4d9e-a55a-b5a5721fd8cc';
update public.facilities set name = 'Sports Hall', description = 'The 3-court sports hall at Shirley High has floor markings for multiple different sports.', sort_order = 4 where id = 'dc726140-6ccb-4f43-bc78-9f03d907ec6d';
update public.facilities set name = 'Drama Studio', description = 'A full blackout drama studio with the added benefit of tiered seating for either a small number of spectators or for your performing arts students to sit on.', sort_order = 5 where id = 'dbf5d40e-ca1e-4cd6-ba93-67f18a76d86b';
update public.facilities set name = 'Grass Football Pitches', description = 'Shirley High is blessed with a lot of outdoor space, including 7v7, 9v9 and 11v11 football pitches.', sort_order = 6 where id = 'dc7c97cd-cc22-47f5-b5c1-80292d5b54e8';
update public.facilities set name = 'Floodlit Netball Courts', description = 'One of the biggest netball facilities in the area, Shirley High''s netball courts are well maintained and all are floodlit for evening games.', sort_order = 7 where id = 'c29dba23-a38c-4905-8c14-05f10412352f';
