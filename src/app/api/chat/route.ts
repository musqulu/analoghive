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

const MAX_CHAT_BODY_BYTES = 16 * 1024
const MAX_CHAT_CONTENT_CHARS = 4000

type JsonBodyResult =
  | { ok: true; body: unknown }
  | { ok: false; status: number; error: string }

async function readLimitedJsonBody(request: Request): Promise<JsonBodyResult> {
  const contentLength = request.headers.get("content-length")
  if (contentLength) {
    const bytes = Number(contentLength)
    if (Number.isFinite(bytes) && bytes > MAX_CHAT_BODY_BYTES) {
      return { ok: false, status: 413, error: "Chat message is too large." }
    }
  }

  if (!request.body) return { ok: false, status: 400, error: "Invalid JSON body." }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    if (received > MAX_CHAT_BODY_BYTES) {
      await reader.cancel()
      return { ok: false, status: 413, error: "Chat message is too large." }
    }
    chunks.push(value)
  }

  try {
    const payload = new Uint8Array(received)
    let offset = 0
    for (const chunk of chunks) {
      payload.set(chunk, offset)
      offset += chunk.byteLength
    }
    const raw = new TextDecoder().decode(payload)
    return { ok: true, body: JSON.parse(raw) as unknown }
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body." }
  }
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

  const bodyResult = await readLimitedJsonBody(request)
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status },
    )
  }

  const parsed = parseBody(bodyResult.body)
  if (!parsed || !parsed.content.trim()) {
    return NextResponse.json(
      {
        error: "Body requires `content` string and optionally `conversationId` (UUID string).",
      },
      { status: 400 },
    )
  }
  if (parsed.content.length > MAX_CHAT_CONTENT_CHARS) {
    return NextResponse.json(
      { error: "Chat message must be 4000 characters or fewer." },
      { status: 413 },
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
