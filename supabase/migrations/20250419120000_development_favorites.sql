-- Saved calculator combinations per user (Favorites)

create table public.development_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  film_name text not null,
  film_format text not null check (film_format in ('35mm', '120', 'sheet')),
  film_iso text not null,
  developer_name text not null,
  option_key text not null,
  push_pull_stops smallint not null default 0,
  total_volume integer not null default 500,
  temperature_unit text not null check (temperature_unit in ('celsius', 'fahrenheit')),
  modified_temperature numeric not null,
  constant_agitation boolean not null default false,
  corrected_time_minutes double precision not null,
  created_at timestamptz not null default now()
);

create index development_favorites_user_created_idx
  on public.development_favorites (user_id, created_at desc);

alter table public.development_favorites enable row level security;

create policy "Users can select own favorites"
  on public.development_favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.development_favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.development_favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);
