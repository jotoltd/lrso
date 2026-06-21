create policy "Anon can update venues"
  on public.venues for update
  using (true);
