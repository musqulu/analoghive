import { NextResponse } from "next/server"
import { requestOrigin } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

function safeNext(next: string | null, fallback = "/workspace") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback
  return next
}

export async function GET(request: Request) {
  const origin = requestOrigin(request)
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = safeNext(searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Could not confirm your session. Try signing in again.")}`,
  )
}
