import type { SupabaseClient } from "@supabase/supabase-js"

export const NEW_CHAT_TITLE = "New chat"

export type ChatRole = "user" | "assistant"

export interface ChatConversationSummary {
  id: string
  title: string
  lastMessagePreview: string | null
  updatedAt: string
}

export interface DbChatMessage {
  id: string
  role: ChatRole
  content: string
  created_at: string
}

export interface ChatConversationDetail {
  id: string
  user_id: string
  title: string
  summary: string | null
  summary_message_count: number
  last_message_preview: string | null
  updated_at: string
}

export async function listConversations(
  supabase: SupabaseClient,
  userId: string,
): Promise<ChatConversationSummary[]> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("id, title, last_message_preview, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    lastMessagePreview: (row.last_message_preview as string | null) ?? null,
    updatedAt: row.updated_at as string,
  }))
}

export async function createConversation(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ id: string; title: string }> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({ user_id: userId, title: NEW_CHAT_TITLE })
    .select("id, title")
    .single()

  if (error) throw error
  return { id: data.id as string, title: data.title as string }
}

export async function getConversation(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
): Promise<ChatConversationDetail | null> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .select(
      "id, user_id, title, summary, summary_message_count, last_message_preview, updated_at",
    )
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as Record<string, unknown>
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string,
    summary: (row.summary as string | null) ?? null,
    summary_message_count: row.summary_message_count as number,
    last_message_preview: (row.last_message_preview as string | null) ?? null,
    updated_at: row.updated_at as string,
  }
}

export async function getMessages(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
): Promise<DbChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw error

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    role: row.role as ChatRole,
    content: row.content as string,
    created_at: row.created_at as string,
  }))
}

/** Last K messages in chronological order (most recent K). */
export async function getRecentMessagesForPrompt(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
  k: number,
): Promise<Array<{ role: ChatRole; content: string }>> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(k)

  if (error) throw error

  const rows = (data ?? []) as Array<{ role: ChatRole; content: string }>
  return rows.reverse()
}

export async function countMessages(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)

  if (error) throw error
  return count ?? 0
}

export async function appendMessage(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
  role: ChatRole,
  content: string,
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      role,
      content,
    })
    .select("id")
    .single()

  if (error) throw error
  return { id: data.id as string }
}

export async function updateConversationMeta(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
  patch: {
    last_message_preview?: string | null
    title?: string
    summary?: string | null
    summary_message_count?: number
  },
): Promise<void> {
  const { error } = await supabase
    .from("chat_conversations")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("user_id", userId)

  if (error) throw error
}

export async function deleteConversation(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId)
    .select("id")

  if (error) throw error
  return (data?.length ?? 0) > 0
}

/** Messages after the first N (for summary roll-up). Oldest first. */
export async function getMessagesAfterCount(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
  afterCount: number,
): Promise<Array<{ role: ChatRole; content: string }>> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw error
  const rows = (data ?? []) as Array<{ role: ChatRole; content: string }>
  return rows.slice(afterCount)
}
