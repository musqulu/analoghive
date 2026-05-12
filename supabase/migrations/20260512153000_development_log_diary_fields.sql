-- Optional diary fields for development log entries (title + notes)
-- Idempotent: safe to run if columns already exist (e.g. partial apply).

alter table public.development_log_entries
  add column if not exists title text;

alter table public.development_log_entries
  add column if not exists notes text;

create index if not exists development_log_entries_user_created_with_text_idx
  on public.development_log_entries (user_id, created_at desc)
  where title is not null or notes is not null;
