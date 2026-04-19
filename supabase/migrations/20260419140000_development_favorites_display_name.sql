-- User-editable label for favorites list (nullable = use generated title in app)

alter table public.development_favorites
  add column if not exists display_name text;

create policy "Users can update own favorites"
  on public.development_favorites
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
