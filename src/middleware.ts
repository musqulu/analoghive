import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

function rootAuthRedirect(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") return null

  const code = request.nextUrl.searchParams.get("code")
  if (code) {
    const callbackUrl = request.nextUrl.clone()
    callbackUrl.pathname = "/auth/callback"
    callbackUrl.search = ""
    callbackUrl.searchParams.set("code", code)

    const next = request.nextUrl.searchParams.get("next")
    if (next) callbackUrl.searchParams.set("next", next)

    return NextResponse.redirect(callbackUrl)
  }

  const authError =
    request.nextUrl.searchParams.get("error_description") ??
    request.nextUrl.searchParams.get("error")
  if (authError) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = ""
    loginUrl.searchParams.set("error", authError)
    return NextResponse.redirect(loginUrl)
  }

  return null
}

export async function middleware(request: NextRequest) {
  const authRedirect = rootAuthRedirect(request)
  if (authRedirect) return authRedirect

  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
