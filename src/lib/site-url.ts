function isLocalhostSiteUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url)
}

function hostnameIsLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1"
}

/**
 * Server-side canonical URL (email redirects, etc.).
 * On Vercel, localhost mistakenly copied into NEXT_PUBLIC_SITE_URL must not win over VERCEL_URL.
 */
export function serverSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? ""
  const envLooksLocal = !fromEnv || isLocalhostSiteUrl(fromEnv)

  if (process.env.VERCEL_URL) {
    const vercelHttps = `https://${process.env.VERCEL_URL}`
    if (envLooksLocal) return vercelHttps
    return fromEnv
  }

  if (fromEnv) return fromEnv
  return "http://localhost:3000"
}

/**
 * OAuth redirect base URL. When the user opens the app from a non-localhost host, always use that
 * origin so redirect_to matches Supabase — ignore NEXT_PUBLIC_SITE_URL if set to localhost on Vercel.
 */
export function oauthRedirectOrigin(): string {
  if (typeof window === "undefined") return ""

  const liveOrigin = window.location.origin
  const liveHost = window.location.hostname

  if (!hostnameIsLocalhost(liveHost)) {
    return liveOrigin
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? ""
  if (fromEnv && !isLocalhostSiteUrl(fromEnv)) return fromEnv
  return liveOrigin || fromEnv
}

/** Origin for redirects after OAuth callback (prefer forwarded headers behind proxies). */
export function requestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https"
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }
  return new URL(request.url).origin
}
