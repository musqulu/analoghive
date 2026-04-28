/**
 * Server-side canonical URL (email redirects, etc.). Matches Vercel when
 * NEXT_PUBLIC_SITE_URL is unset.
 */
export function serverSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (fromEnv) return fromEnv
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

/**
 * OAuth redirect base URL. Prefer NEXT_PUBLIC_SITE_URL (set on production) so
 * redirect_to matches Supabase allowlist even if origin detection misbehaves.
 */
export function oauthRedirectOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (fromEnv) return fromEnv
  return typeof window !== "undefined" ? window.location.origin : ""
}
