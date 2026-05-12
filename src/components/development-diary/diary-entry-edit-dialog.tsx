"use client"

import * as Dialog from "@radix-ui/react-dialog"
import * as React from "react"
import { Pencil } from "lucide-react"
import { DiarySummaryLines } from "@/components/development-diary/diary-summary-lines"
import {
  deleteDevelopmentLogEntry,
  updateDiaryEntry,
} from "@/lib/update-diary-entry"
import { LISTING_CARD_MENU_TRIGGER } from "@/constants/listing-card-classes"
import { parseDevelopmentProcessSnapshot } from "@/lib/process-snapshot"
import type { DiaryCompletionSummary, DevelopmentLogEntryRow } from "@/types/development-log"

function rowToSummary(row: DevelopmentLogEntryRow): DiaryCompletionSummary {
  return {
    film_name: row.film_name,
    film_format: row.film_format,
    film_iso: row.film_iso,
    developer_name: row.developer_name,
    option_key: row.option_key,
    total_volume: row.total_volume,
    temperature_unit: row.temperature_unit,
    modified_temperature:
      row.modified_temperature != null && row.modified_temperature !== ""
        ? Number(row.modified_temperature)
        : null,
    push_pull_stops: row.push_pull_stops,
    process_snapshot: parseDevelopmentProcessSnapshot(row.process_snapshot) ?? undefined,
  }
}

export function DiaryEntryEditDialog({
  entry,
  onUpdated,
}: {
  entry: DevelopmentLogEntryRow
  onUpdated: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState(entry.title ?? "")
  const [notes, setNotes] = React.useState(entry.notes ?? "")
  const [busy, setBusy] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setTitle(entry.title ?? "")
      setNotes(entry.notes ?? "")
    }
  }, [open, entry.id, entry.title, entry.notes])

  const close = () => {
    setOpen(false)
    setBusy(false)
    setDeleting(false)
  }

  const save = async () => {
    setBusy(true)
    const ok = await updateDiaryEntry({
      id: entry.id,
      title: title.trim() ? title.trim() : null,
      notes: notes.trim() ? notes.trim() : null,
    })
    setBusy(false)
    if (!ok) return
    onUpdated()
    close()
  }

  const remove = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Remove this diary entry from your log? This cannot be undone.")
    )
      return
    setDeleting(true)
    const ok = await deleteDevelopmentLogEntry(entry.id)
    setDeleting(false)
    if (!ok) return
    onUpdated()
    close()
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={LISTING_CARD_MENU_TRIGGER}
          aria-label={`Edit diary for ${entry.film_name}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] max-h-[min(90vh,32rem)] w-[min(calc(100%-2rem),24rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-ds-card outline-none">
          <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
            Edit diary entry
          </Dialog.Title>
          <div className="mt-4 rounded-md border border-border bg-muted/40 p-4">
            <DiarySummaryLines summary={rowToSummary(entry)} />
          </div>
          <div className="mt-4 space-y-3">
            <input
              className="ds-input w-full"
              placeholder="Title (optional)"
              value={title}
              autoComplete="off"
              disabled={busy || deleting}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="ds-input min-h-[5.5rem] w-full resize-y"
              placeholder="Notes (optional)"
              value={notes}
              rows={5}
              disabled={busy || deleting}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-2">
            <button
              type="button"
              className="text-sm font-medium text-destructive underline-offset-2 hover:underline disabled:opacity-50"
              disabled={busy || deleting}
              onClick={() => void remove()}
            >
              {deleting ? "Deleting…" : "Delete entry"}
            </button>
            <div className="flex gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                  disabled={busy || deleting}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
                disabled={busy || deleting}
                onClick={() => void save()}
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
