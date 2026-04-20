-- Personal development recipes (customized process snapshots per user)

create table public.development_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index development_recipes_user_updated_idx
  on public.development_recipes (user_id, updated_at desc);

alter table public.development_recipes enable row level security;

create policy "Users can select own recipes"
  on public.development_recipes
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own recipes"
  on public.development_recipes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own recipes"
  on public.development_recipes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own recipes"
  on public.development_recipes
  for delete
  to authenticated
  using (auth.uid() = user_id);
