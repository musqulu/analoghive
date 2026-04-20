"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import Link from "next/link"
import { NotebookPen } from "lucide-react"
import { useAuthSession } from "@/components/auth-session-provider"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"
import { buildRecipeNewHref } from "@/lib/recipe-draft-query"
import { ButtonLink } from "@/components/landing/button"
import { cn } from "@/lib/utils"

interface CreateRecipeFromButtonProps {
  snapshot: DevelopmentFavoriteSnapshot & { correctedTimeMinutes: number }
  isColor: boolean
  chartReferenceNote?: string | null
  pushPullLine?: string | null
  className?: string
}

export function CreateRecipeFromButton({
  snapshot,
  isColor,
  chartReferenceNote,
  pushPullLine,
  className,
}: CreateRecipeFromButtonProps) {
  const { user } = useAuthSession()
  const [authOpen, setAuthOpen] = React.useState(false)

  const href = buildRecipeNewHref(snapshot, {
    isColor,
    chartReferenceNote: chartReferenceNote ?? undefined,
    pushPullLine: pushPullLine ?? undefined,
  })

  const nextHref = `/login?next=${encodeURIComponent(href)}`

  if (user) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
          className,
        )}
      >
        <NotebookPen size={14} aria-hidden />
        Create recipe from this
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAuthOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
          className,
        )}
      >
        <NotebookPen size={14} aria-hidden />
        Create recipe from this
      </button>

      <Dialog.Root open={authOpen} onOpenChange={setAuthOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[50] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[50] w-[min(100%,20rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-ds-card outline-none data-[state=open]:animate-in data-[state=closed]:animate-out">
            <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
              Sign in to create a recipe
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm/6 text-muted-foreground">
              Recipes are saved personal workflows — sign in to fork this chart result into your
              recipe book.
            </Dialog.Description>
            <div className="mt-6 flex flex-col gap-3">
              <ButtonLink href={nextHref} color="dark/light" size="md" className="w-full">
                Sign in
              </ButtonLink>
              <ButtonLink href={`/signup?next=${encodeURIComponent(href)}`} color="light" size="md" className="w-full">
                Create account
              </ButtonLink>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="mt-4 w-full text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                Cancel
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
