import { NextResponse } from "next/server"
import { createConversation, listConversations } from "@/lib/ai/conversation-store"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

async function unauthorized() {
  return NextResponse.json({ error: "Sign in required." }, { status: 401 })
}

/** GET — list chats (messenger inbox). */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const rows = await listConversations(supabase, user.id)
  return NextResponse.json({
    conversations: rows.map((c) => ({
      id: c.id,
      title: c.title,
      lastMessagePreview: c.lastMessagePreview,
      updatedAt: c.updatedAt,
    })),
  })
}

/** POST — start a blank chat row. Client opens thread after this. */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const row = await createConversation(supabase, user.id)
  return NextResponse.json({ id: row.id, title: row.title })
}
