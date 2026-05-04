import { NextResponse } from "next/server"
import { getConversation } from "@/lib/ai/conversation-store"
import { createNdjsonChatStream, ndjsonHeaders } from "@/lib/ai/process-chat-turn"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ChatPostBody = {
  conversationId?: string | null
  content: string
}

function parseBody(body: unknown): ChatPostBody | null {
  if (!body || typeof body !== "object") return null
  const b = body as Record<string, unknown>
  const content = b.content
  if (typeof content !== "string") return null

  const rawId = "conversationId" in b ? b.conversationId : undefined
  if (
    rawId !== undefined &&
    rawId !== null &&
    typeof rawId !== "string"
  ) {
    return null
  }

  return {
    content,
    conversationId: rawId === undefined ? undefined : (rawId as string | null),
  }
}

export async function POST(request: Request) {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return NextResponse.json(
      {
        error:
          "AI assistant is not configured. Set REPLICATE_API_TOKEN on the server.",
      },
      { status: 500 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Sign in to chat with the assistant." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }
  const parsed = parseBody(body)
  if (!parsed || !parsed.content.trim()) {
    return NextResponse.json(
      {
        error: "Body requires `content` string and optionally `conversationId` (UUID string).",
      },
      { status: 400 },
    )
  }

  if (parsed.conversationId) {
    const conv = await getConversation(supabase, user.id, parsed.conversationId)
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 })
    }
  }

  const stream = createNdjsonChatStream({
    supabase,
    userId: user.id,
    replicateToken: token,
    conversationId: parsed.conversationId,
    content: parsed.content,
  })

  return new Response(stream, { headers: ndjsonHeaders() })
}
