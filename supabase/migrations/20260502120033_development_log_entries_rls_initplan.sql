-- Optimize RLS policies on development_log_entries to wrap auth.uid() in a subquery,
-- so it is evaluated once per query instead of once per row (Supabase advisor 0003).

drop policy "Users can select own log entries" on public.development_log_entries;
drop policy "Users can insert own log entries" on public.development_log_entries;
drop policy "Users can update own log entries" on public.development_log_entries;
drop policy "Users can delete own log entries" on public.development_log_entries;

create policy "Users can select own log entries"
  on public.development_log_entries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own log entries"
  on public.development_log_entries
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own log entries"
  on public.development_log_entries
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own log entries"
  on public.development_log_entries
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
