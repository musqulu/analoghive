-- Personal development log entries (auto-recorded when the timer's dev step completes)

create table public.development_log_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  film_name text not null,
  film_format text not null check (film_format in ('35mm', '120', 'sheet')),
  film_iso text not null,
  developer_name text not null,
  option_key text not null,
  total_volume integer,
  temperature_unit text check (temperature_unit in ('celsius', 'fahrenheit')),
  modified_temperature numeric,
  push_pull_stops smallint,
  recipe_id uuid references public.development_recipes (id) on delete set null,
  favorite_id uuid references public.development_favorites (id) on delete set null,
  created_at timestamptz not null default now()
);

create index development_log_entries_user_created_idx
  on public.development_log_entries (user_id, created_at desc);

create index development_log_entries_recipe_idx
  on public.development_log_entries (recipe_id);

create index development_log_entries_favorite_idx
  on public.development_log_entries (favorite_id);

alter table public.development_log_entries enable row level security;

create policy "Users can select own log entries"
  on public.development_log_entries
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own log entries"
  on public.development_log_entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own log entries"
  on public.development_log_entries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own log entries"
  on public.development_log_entries
  for delete
  to authenticated
  using (auth.uid() = user_id);
