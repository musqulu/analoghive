"use client"

import { signOut } from "@/app/auth/actions"
import { useAuthSession } from "@/components/auth-session-provider"
import { Button, ButtonLink } from "@/components/landing/button"
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

function GuestControls({
  className,
  pending,
}: {
  className?: string
  pending?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3",
        pending && "opacity-80 transition-opacity",
        className,
      )}
      aria-busy={pending ? true : undefined}
    >
      <ButtonLink href="/login" color="light" size="md" className="max-md:w-full">
        Login
      </ButtonLink>
      <ButtonLink href="/signup" color="dark/light" size="md" className="max-md:w-full">
        Sign Up
      </ButtonLink>
    </div>
  )
}

export function AuthNav({ className }: { className?: string }) {
  const { resolved, authenticatedOnServer, showAuthed } = useAuthSession()

  const isColumn = className?.includes("flex-col")
  const guestPending = !resolved && !authenticatedOnServer

  if (showAuthed) {
    return (
      <DashboardControls className={className} layout={isColumn ? "column" : "row"} />
    )
  }

  return <GuestControls className={className} pending={guestPending} />
}
