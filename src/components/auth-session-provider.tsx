"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

type AuthSessionContextValue = {
  user: User | null
  resolved: boolean
  authenticatedOnServer: boolean
  showAuthed: boolean
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

export function AuthSessionProvider({
  children,
  authenticatedOnServer,
}: {
  children: React.ReactNode
  authenticatedOnServer: boolean
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const applySession = (session: Session | null) => {
      setUser(session?.user ?? null)
      setResolved(true)
    }

    void supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      applySession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      applySession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Server Action sign-in can soft-navigate without remounting this tree; GoTrue may not emit
   * `SIGNED_IN` when only server cookies change. Re-read session when the server flag or route updates.
   */
  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null)
      setResolved(true)
    })
  }, [authenticatedOnServer, pathname])

  const showAuthed = Boolean(user) || authenticatedOnServer

  const value = useMemo(
    () => ({
      user,
      resolved,
      authenticatedOnServer,
      showAuthed,
    }),
    [user, resolved, authenticatedOnServer, showAuthed],
  )

  return (
    <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
  )
}

export function useAuthSession(): AuthSessionContextValue {
  const ctx = useContext(AuthSessionContext)
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider")
  }
  return ctx
}
