-- Allow anon to delete contacts (for admin dashboard)
create policy "Anon can delete contacts"
  on public.contacts for delete
  using (true);
