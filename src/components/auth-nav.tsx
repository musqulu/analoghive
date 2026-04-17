"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { signOut } from "@/app/auth/actions"
import { Button, ButtonLink } from "@/components/landing/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

function DashboardControls({
  className,
  layout = "row",
}: {
  className?: string
  layout?: "row" | "column"
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3",
        layout === "column" && "flex-col items-stretch",
        className,
      )}
    >
      <ButtonLink href="/workspace" color="light" size="md" className="max-md:w-full">
        Dashboard
      </ButtonLink>
      <form action={signOut} className="max-md:w-full">
        <Button type="submit" color="dark/light" size="md" className="max-md:w-full">
          Sign out
        </Button>
      </form>
    </div>
  )
}

function GuestControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-end gap-3", className)}>
      <ButtonLink href="/login" color="light" size="md" className="max-md:w-full">
        Login
      </ButtonLink>
      <ButtonLink href="/signup" color="dark/light" size="md" className="max-md:w-full">
        Sign Up
      </ButtonLink>
    </div>
  )
}

export function AuthNav({
  className,
  authenticatedOnServer = false,
}: {
  className?: string
  authenticatedOnServer?: boolean
}) {
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

  const isColumn = className?.includes("flex-col")
  const showAuthed = Boolean(user) || (authenticatedOnServer && !resolved)

  if (!resolved && !authenticatedOnServer) {
    return (
      <div
        className={cn("flex h-10 min-w-[8.5rem] items-center justify-end gap-3", className)}
        aria-hidden
      >
        <span className="h-9 w-20 rounded-md bg-muted" />
        <span className="h-9 w-24 rounded-md bg-muted" />
      </div>
    )
  }

  if (showAuthed) {
    return (
      <DashboardControls className={className} layout={isColumn ? "column" : "row"} />
    )
  }

  return <GuestControls className={className} />
}
