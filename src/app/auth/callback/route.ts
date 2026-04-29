import { type NextRequest, NextResponse } from "next/server"
import { requestOrigin } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

const AUTH_NEXT_COOKIE = "auth_next"

function safeNext(next: string | null, fallback = "/workspace") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback
  return next
}

function clearNextCookie(response: NextResponse) {
  response.cookies.set(AUTH_NEXT_COOKIE, "", { path: "/", maxAge: 0 })
}

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request)
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const cookieNext = request.cookies.get(AUTH_NEXT_COOKIE)?.value ?? null
  const next = safeNext(searchParams.get("next") ?? cookieNext)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`)
      clearNextCookie(response)
      return response
    }
    console.error("Supabase auth callback failed", {
      message: error.message,
      status: error.status,
      code: error.code,
      next,
    })
  }

  const errorResponse = NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Could not confirm your session. Try signing in again.")}`,
  )
  clearNextCookie(errorResponse)
  return errorResponse
}
