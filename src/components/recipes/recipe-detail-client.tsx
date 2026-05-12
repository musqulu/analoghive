"use client"

import * as React from "react"
import Link from "next/link"
import * as Dialog from "@radix-ui/react-dialog"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Timer } from "@/components/ui/timer"
import { DiaryCompletionDialog } from "@/components/development-diary/completion-dialog"
import { Button } from "@/components/landing/button"
import { recipePayloadToTimerProps, type RecipePayloadV1 } from "@/types/recipe"
import { logDevelopmentRun } from "@/lib/log-development-run"
import type {
  DiaryCompletionSummary,
  DevelopmentProcessSnapshot,
} from "@/types/development-log"

export function RecipeDetailClient({
  recipeId,
  payload,
}: {
  recipeId: string
  payload: RecipePayloadV1
}) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const timerProps = recipePayloadToTimerProps(payload)
  const combinedNotes =
    [payload.notes, payload.dilutionNote, payload.agitationNotes]
      .filter(Boolean)
      .join("\n\n")
      .trim() || undefined

  const diarySummary = React.useMemo<DiaryCompletionSummary>(
    () => ({
      film_name: payload.identity.filmName,
      film_format: payload.identity.filmFormat,
      film_iso: payload.identity.filmIso,
      developer_name: payload.identity.developerName,
      option_key: payload.identity.optionKey,
      total_volume: payload.totalVolume,
      temperature_unit: payload.temperatureUnit,
      modified_temperature: payload.modifiedTemperature,
      push_pull_stops: payload.identity.pushPullStops,
    }),
    [
      payload.identity.filmFormat,
      payload.identity.filmIso,
      payload.identity.filmName,
      payload.identity.developerName,
      payload.identity.optionKey,
      payload.identity.pushPullStops,
      payload.modifiedTemperature,
      payload.temperatureUnit,
      payload.totalVolume,
    ],
  )

  const logEntryIdRef = React.useRef<string | null>(null)
  const [celebrateOpen, setCelebrateOpen] = React.useState(false)
  const [celebrateLogId, setCelebrateLogId] = React.useState<string | null>(null)
  const [celebrateProcessSnapshot, setCelebrateProcessSnapshot] =
    React.useState<DevelopmentProcessSnapshot | null>(null)

  // Auto-log a darkroom entry the first time the dev step finishes for this
  // recipe in this page-load. The hook re-arms internally on each startTimer
  // ("dev"), but we cap to one persisted entry per page-load so retries don't
  // multiply rolls.
  const loggedRef = React.useRef(false)
  const handleDevComplete = React.useCallback(
    (processSnapshot: DevelopmentProcessSnapshot) => {
      if (loggedRef.current) return
      loggedRef.current = true
      void logDevelopmentRun({
        film_name: payload.identity.filmName,
        film_format: payload.identity.filmFormat,
        film_iso: payload.identity.filmIso,
        developer_name: payload.identity.developerName,
        option_key: payload.identity.optionKey,
        total_volume: payload.totalVolume,
        temperature_unit: payload.temperatureUnit,
        modified_temperature: payload.modifiedTemperature,
        push_pull_stops: payload.identity.pushPullStops,
        recipe_id: recipeId,
        favorite_id: null,
        process_snapshot: processSnapshot,
      }).then((res) => {
        if (res) logEntryIdRef.current = res.id
        else loggedRef.current = false
      })
    },
    [recipeId, payload],
  )

  const handleProcessComplete = React.useCallback(
    (processSnapshot: DevelopmentProcessSnapshot) => {
      setCelebrateProcessSnapshot(processSnapshot)
      setCelebrateLogId(logEntryIdRef.current)
      setCelebrateOpen(true)
    },
    [],
  )

  const handleCelebrateOpenChange = React.useCallback((open: boolean) => {
    setCelebrateOpen(open)
    if (!open) setCelebrateProcessSnapshot(null)
  }, [])

  const remove = async () => {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("development_recipes").delete().eq("id", recipeId)
    setDeleting(false)
    if (error) return
    setDeleteOpen(false)
    router.push("/recipes")
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
        <p className="font-medium text-foreground">Your recipe</p>
        <p className="mt-1 text-muted-foreground">
          This is your saved process — not a chart reference. Edit anytime or run the timer below.
        </p>
        {payload.preSoak === true && (payload.processTimes.preSoak ?? 0) > 0 ? (
          <p className="mt-2 text-muted-foreground">
            <span className="font-medium text-foreground">Pre soak:</span>{" "}
            {payload.processTimes.preSoak} min before development
          </p>
        ) : payload.preSoak === true ? (
          <p className="mt-2 text-muted-foreground">
            <span className="font-medium text-foreground">Pre soak:</span> enabled (set a duration in
            edit if missing)
          </p>
        ) : null}
      </div>

      <DiaryCompletionDialog
        open={celebrateOpen}
        onOpenChange={handleCelebrateOpenChange}
        logEntryId={celebrateLogId}
        summary={{ ...diarySummary, process_snapshot: celebrateProcessSnapshot ?? undefined }}
      />
      <Timer
        key={recipeId}
        {...timerProps}
        initialProcessTimes={payload.processTimes}
        initialWashingMethod={payload.washingMethod}
        recipeNotes={combinedNotes}
        onDevComplete={handleDevComplete}
        onProcessComplete={handleProcessComplete}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={`/recipes/${recipeId}/edit`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Edit recipe
        </Link>
        <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-muted"
            >
              Delete recipe
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[50] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-[50] w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-ds-card outline-none">
              <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
                Delete this recipe?
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                This removes the saved recipe from your account. You can’t undo this.
              </Dialog.Description>
              <div className="mt-6 flex justify-end gap-3">
                <Dialog.Close asChild>
                  <Button type="button" color="light" size="md">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  type="button"
                  color="dark/light"
                  size="md"
                  disabled={deleting}
                  onClick={() => void remove()}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  )
}
