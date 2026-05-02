function isLocalhostSiteUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url)
}

function hostnameIsLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1"
}

function firstForwardedValue(value: string | null): string {
  return value?.split(",")[0]?.trim() ?? ""
}

function parseOrigin(value: string): URL | null {
  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url
  } catch {
    return null
  }
}

function addTrustedHost(hosts: Set<string>, origin: string) {
  const url = parseOrigin(origin)
  if (url) hosts.add(url.host)
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

/** Origin for redirects after OAuth callback. */
export function requestOrigin(request: Request): string {
  const requestUrl = new URL(request.url)
  const forwardedHost = firstForwardedValue(request.headers.get("x-forwarded-host"))
  if (!forwardedHost) return requestUrl.origin

  const forwardedProto = firstForwardedValue(request.headers.get("x-forwarded-proto")) || "https"
  if (forwardedProto !== "http" && forwardedProto !== "https") return requestUrl.origin

  const forwardedUrl = parseOrigin(`${forwardedProto}://${forwardedHost}`)
  if (!forwardedUrl) return requestUrl.origin

  const trustedHosts = new Set<string>([requestUrl.host])
  addTrustedHost(trustedHosts, serverSiteUrl())
  if (process.env.VERCEL_URL) addTrustedHost(trustedHosts, `https://${process.env.VERCEL_URL}`)

  return trustedHosts.has(forwardedUrl.host) ? forwardedUrl.origin : requestUrl.origin
}
