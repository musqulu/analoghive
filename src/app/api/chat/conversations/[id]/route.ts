import { NextResponse } from "next/server"
import { deleteConversation } from "@/lib/ai/conversation-store"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 })

  const { id } = await context.params
  const ok = await deleteConversation(supabase, user.id, id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
