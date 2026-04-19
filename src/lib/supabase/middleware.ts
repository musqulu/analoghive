import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Refreshes the Supabase session. Only mutates the *response* cookies — never
 * `request.cookies.set`, which can break in Next.js 15 middleware / Edge.
 * @see https://github.com/supabase/ssr/blob/main/docs/design.md
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, responseHeaders) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
          if (responseHeaders && typeof responseHeaders === "object") {
            for (const [key, value] of Object.entries(responseHeaders)) {
              if (typeof value === "string") {
                supabaseResponse.headers.set(key, value)
              }
            }
          }
        },
      },
    },
  )

  await supabase.auth.getUser()

  return supabaseResponse
}
