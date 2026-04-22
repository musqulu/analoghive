"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Bookmark } from "lucide-react"
import { useAuthSession } from "@/components/auth-session-provider"
import { createClient } from "@/lib/supabase/client"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"
import { snapshotToInsert } from "@/types/favorite"
import { ButtonLink } from "@/components/landing/button"
import { cn } from "@/lib/utils"
import type { FilmFormat } from "@/types/development"

interface SaveFavoriteButtonProps {
  snapshot: DevelopmentFavoriteSnapshot & { correctedTimeMinutes: number }
  className?: string
}

export function SaveFavoriteButton({ snapshot, className }: SaveFavoriteButtonProps) {
  const { user } = useAuthSession()
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [authOpen, setAuthOpen] = React.useState(false)

  const save = async () => {
    setBusy(true)
    setError(null)
    const supabase = createClient()
    let uid = user?.id
    if (!uid) {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      uid = session?.user.id
    }
    if (!uid) {
      setBusy(false)
      setAuthOpen(true)
      return
    }

    const { error: insertError } = await supabase
      .from("development_favorites")
      .insert(snapshotToInsert(uid, snapshot))
    setBusy(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <div className={cn("flex flex-col items-end gap-1", className)}>
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          aria-busy={busy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Bookmark size={14} aria-hidden />
          {saved ? "Saved!" : busy ? "Saving…" : "Save to Favorites"}
        </button>
        {error ? (
          <p className="max-w-xs text-right text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <Dialog.Root open={authOpen} onOpenChange={setAuthOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[50] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[50] w-[min(100%,20rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-ds-card outline-none data-[state=open]:animate-in data-[state=closed]:animate-out">
            <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
              Sign in to save favorites
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm/6 text-muted-foreground">
              Save this development setup to your account and open it again from Favorites.
            </Dialog.Description>
            <div className="mt-6 flex flex-col gap-3">
              <ButtonLink href="/login?next=/develop" color="dark/light" size="md" className="w-full">
                Sign in
              </ButtonLink>
              <ButtonLink href="/signup?next=/develop" color="light" size="md" className="w-full">
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

export function buildFavoriteSnapshotFromCalculator(props: {
  filmName: string
  filmFormat: FilmFormat
  filmIso: string
  developerName: string
  optionKey: string
  pushPullStops: number
  totalVolume: number
  temperatureUnit: string
  modifiedTemperature: number
  constantAgitation: boolean
  correctedTimeMinutes: number
}): DevelopmentFavoriteSnapshot & { correctedTimeMinutes: number } {
  const tu = props.temperatureUnit
  if (tu !== "celsius" && tu !== "fahrenheit") {
    throw new Error("Invalid temperature unit")
  }
  return {
    filmName: props.filmName,
    filmFormat: props.filmFormat,
    filmIso: props.filmIso,
    developerName: props.developerName,
    optionKey: props.optionKey,
    pushPullStops: props.pushPullStops,
    totalVolume: props.totalVolume,
    temperatureUnit: tu,
    modifiedTemperature: props.modifiedTemperature,
    constantAgitation: props.constantAgitation,
    correctedTimeMinutes: props.correctedTimeMinutes,
  }
}
