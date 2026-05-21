import { NextResponse } from "next/server"
import { getConversation, getMessages } from "@/lib/ai/conversation-store"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 })

  const { id } = await context.params
  const conversation = await getConversation(supabase, user.id, id)
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 })
  }

  const msgs = await getMessages(supabase, user.id, id)
  return NextResponse.json({
    messages: msgs.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.created_at,
    })),
  })
}
