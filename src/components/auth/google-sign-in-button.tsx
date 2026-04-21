"use client"

import { useState } from "react"
import { Button } from "@/components/landing/button"
import { createClient } from "@/lib/supabase/client"

function safeNext(path: string, fallback = "/workspace") {
  if (!path.startsWith("/") || path.startsWith("//")) return fallback
  return path
}

export function AuthMethodDivider() {
  return (
    <div className="relative py-2" role="separator" aria-label="Or continue with email">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
        <span className="bg-card px-2 text-muted-foreground">Or</span>
      </div>
    </div>
  )
}

export function GoogleSignInButton({ next }: { next: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const target = safeNext(next)

  async function handleClick() {
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`,
        },
      })
      if (oauthError) {
        setError(oauthError.message)
        setLoading(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        color="light"
        className="w-full"
        disabled={loading}
        onClick={() => void handleClick()}
      >
        {loading ? "Redirecting…" : "Continue with Google"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
