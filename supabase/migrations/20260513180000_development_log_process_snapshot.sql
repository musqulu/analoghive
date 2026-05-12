-- Full reproducible process (times, washing method, temps) captured per log row

alter table public.development_log_entries
  add column if not exists process_snapshot jsonb;
