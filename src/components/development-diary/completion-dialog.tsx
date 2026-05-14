"use client"

import * as Dialog from "@radix-ui/react-dialog"
import * as React from "react"
import { DiarySummaryLines } from "@/components/development-diary/diary-summary-lines"
import { burstCelebrationConfetti } from "@/components/development-diary/confetti"
import { updateDiaryEntry } from "@/lib/update-diary-entry"
import type { DiaryCompletionSummary } from "@/types/development-log"

export function DiaryCompletionDialog({
  open,
  onOpenChange,
  logEntryId,
  summary,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  logEntryId: string | null
  summary: DiaryCompletionSummary | null
}) {
  const [title, setTitle] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    burstCelebrationConfetti()
    setTitle("")
    setNotes("")
    setBusy(false)
    setSaveError(null)
  }, [open])

  const handleSave = async () => {
    if (!logEntryId) {
      onOpenChange(false)
      return
    }
    setBusy(true)
    setSaveError(null)
    const ok = await updateDiaryEntry({
      id: logEntryId,
      title: title.trim() ? title.trim() : null,
      notes: notes.trim() ? notes.trim() : null,
    })
    setBusy(false)
    if (!ok) {
      setSaveError("We couldn't save your diary notes. Please try again before closing this dialog.")
      return
    }
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] max-h-[min(94vh,52rem)] w-[min(calc(100%-2rem),24rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-ds-card outline-none">
          <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
            Roll developed
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-sm text-muted-foreground">
            You finished the whole process — add an optional diary title or notes whenever you revisit the results.
          </Dialog.Description>

          {summary ? (
            <div className="mt-4 rounded-md border border-border bg-muted/40 p-4">
              <DiarySummaryLines summary={summary} />
            </div>
          ) : null}

          {logEntryId ? (
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="diary-completion-title" className="sr-only">
                  Diary title (optional)
                </label>
                <input
                  id="diary-completion-title"
                  className="ds-input w-full"
                  placeholder="Title (optional)"
                  value={title}
                  autoComplete="off"
                  disabled={busy}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="diary-completion-notes" className="sr-only">
                  Diary notes (optional)
                </label>
                <textarea
                  id="diary-completion-notes"
                  className="ds-input min-h-[5.5rem] w-full resize-y"
                  placeholder="Notes (optional) — tones, negatives, reminders for next time…"
                  value={notes}
                  disabled={busy}
                  rows={5}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              {saveError ? (
                <p className="text-sm text-destructive" role="alert">
                  {saveError}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              Sign in before developing to save diary entries alongside your automated log.
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                disabled={busy}
              >
                Skip
              </button>
            </Dialog.Close>
            {logEntryId ? (
              <button
                type="button"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
                disabled={busy}
                onClick={() => void handleSave()}
              >
                {busy ? "Saving…" : "Save"}
              </button>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
