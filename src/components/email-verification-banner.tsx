"use client"

import { useActionState } from "react"
import { resendSignupVerification } from "@/app/auth/actions"
import { Button } from "@/components/landing/button"
import { cn } from "@/lib/utils"

function ResendButton({ disabled }: { disabled: boolean }) {
  return (
    <Button type="submit" color="light" size="md" disabled={disabled} className="shrink-0">
      {disabled ? "Sending…" : "Resend verification email"}
    </Button>
  )
}

export function EmailVerificationBanner({
  email,
  graceDays,
}: {
  email: string
  graceDays: number
}) {
  const [state, formAction, isPending] = useActionState(resendSignupVerification, null)

  return (
    <div
      className="w-full border-b border-border bg-muted px-6 py-3 shadow-ds lg:px-10"
      role="region"
      aria-label="Email verification reminder"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-sm/7 font-medium text-foreground">
            Please verify your email within {graceDays}{" "}
            {graceDays === 1 ? "day" : "days"}. Unverified accounts may be removed.
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p>
          {state ? (
            <p
              className={cn("mt-2 text-sm/6", state.ok ? "text-foreground" : "text-destructive")}
              role="status"
            >
              {state.message}
            </p>
          ) : null}
        </div>
        <form action={formAction} className="flex shrink-0 flex-col gap-2 sm:items-end">
          <input type="hidden" name="email" value={email} />
          <ResendButton disabled={isPending} />
        </form>
      </div>
    </div>
  )
}
