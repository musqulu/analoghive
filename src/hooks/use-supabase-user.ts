"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

/**
 * Client-side auth state for UI that should mirror SSR `authenticatedOnServer`
 * (same pattern as {@link AuthNav}).
 */
export function useSupabaseUser(authenticatedOnServer = false) {
  const [user, setUser] = useState<User | null>(null)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setResolved(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const showAuthed = Boolean(user) || (authenticatedOnServer && !resolved)

  return { user, resolved, showAuthed }
}
