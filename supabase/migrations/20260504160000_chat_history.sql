-- AI assistant chat conversations and messages per user

create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'New chat',
  summary text,
  summary_message_count integer not null default 0,
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chat_conversations_user_updated_idx
  on public.chat_conversations (user_id, updated_at desc);

alter table public.chat_conversations enable row level security;

create policy "Users can select own chat conversations"
  on public.chat_conversations
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own chat conversations"
  on public.chat_conversations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own chat conversations"
  on public.chat_conversations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own chat conversations"
  on public.chat_conversations
  for delete
  to authenticated
  using (auth.uid() = user_id);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_conversation_created_idx
  on public.chat_messages (conversation_id, created_at asc);

alter table public.chat_messages enable row level security;

create policy "Users can select own chat messages"
  on public.chat_messages
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own chat messages"
  on public.chat_messages
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.chat_conversations c
      where c.id = chat_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users can delete own chat messages"
  on public.chat_messages
  for delete
  to authenticated
  using (auth.uid() = user_id);
