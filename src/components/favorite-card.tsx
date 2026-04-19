"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { buildDevelopFavoriteHref } from "@/lib/favorite-develop-query"
import {
  favoriteListTitle,
  rowToSnapshot,
  type DevelopmentFavoriteRow,
} from "@/types/favorite"
import { normalizeDilutionDisplay } from "@/utils/normalize-dilution"
import { formatTime } from "@/utils/format-time"
import { Button } from "@/components/landing/button"

const DISPLAY_NAME_MAX = 120

interface FavoriteCardProps {
  row: DevelopmentFavoriteRow
  onDeleted: (id: string) => void
  onRestore: (row: DevelopmentFavoriteRow) => void
  onRenamed: (id: string, next: DevelopmentFavoriteRow) => void
}

export function FavoriteCard({ row, onDeleted, onRestore, onRenamed }: FavoriteCardProps) {
  const [busy, setBusy] = React.useState(false)
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState("")
  const [renameError, setRenameError] = React.useState<string | null>(null)
  const [renameBusy, setRenameBusy] = React.useState(false)

  const snapshot = rowToSnapshot(row)

  const dilution = row.option_key.split("|")[0] ?? ""
  const timeDisplay = formatTime(Number(row.corrected_time_minutes) * 60)

  const href = buildDevelopFavoriteHref(snapshot)

  const title = favoriteListTitle(row)

  React.useEffect(() => {
    if (renameOpen) {
      setRenameValue(row.display_name?.trim() ?? "")
      setRenameError(null)
    }
  }, [renameOpen, row.display_name])

  const remove = async () => {
    setBusy(true)
    onDeleted(row.id)
    const supabase = createClient()
    const { error } = await supabase.from("development_favorites").delete().eq("id", row.id)
    setBusy(false)
    if (error) {
      onRestore(row)
    }
  }

  const saveRename = async () => {
    const trimmed = renameValue.trim()
    if (trimmed.length > DISPLAY_NAME_MAX) {
      setRenameError(`Use at most ${DISPLAY_NAME_MAX} characters.`)
      return
    }
    const nextName = trimmed.length === 0 ? null : trimmed
    setRenameError(null)
    setRenameBusy(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("development_favorites")
      .update({ display_name: nextName })
      .eq("id", row.id)
    setRenameBusy(false)
    if (error) {
      setRenameError(error.message)
      return
    }
    onRenamed(row.id, { ...row, display_name: nextName })
    setRenameOpen(false)
  }

  return (
    <div className="flex min-w-0 items-start justify-between rounded-lg bg-card p-4 ds-card">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-medium">{title}</p>
        <p className="text-sm text-foreground">
          {row.film_name} ({row.film_format}) · ISO {row.film_iso}
        </p>
        <p className="text-sm text-muted-foreground">
          {row.developer_name} ({normalizeDilutionDisplay(dilution)}) · {timeDisplay}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.total_volume}ml · {row.modified_temperature}
          {row.temperature_unit === "celsius" ? "°C" : "°F"}
        </p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-1">
        <Link
          href={href}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={() => setRenameOpen(true)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          aria-label="Rename favorite"
        >
          <Pencil size={14} aria-hidden />
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void remove()}
          className="rounded-md p-1.5 text-destructive transition-colors hover:bg-muted disabled:opacity-50"
          aria-label="Remove favorite"
        >
          <Trash2 size={14} aria-hidden />
        </button>
      </div>

      <Dialog.Root open={renameOpen} onOpenChange={setRenameOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[50] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[50] w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-ds-card outline-none data-[state=open]:animate-in data-[state=closed]:animate-out">
            <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
              Rename favorite
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Leave blank to use the default title ({favoriteListTitle({ ...row, display_name: null })}).
            </Dialog.Description>
            <div className="mt-4">
              <label htmlFor={`favorite-name-${row.id}`} className="sr-only">
                Display name
              </label>
              <input
                id={`favorite-name-${row.id}`}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={DISPLAY_NAME_MAX}
                className="ds-input w-full"
                placeholder="Custom name"
                autoComplete="off"
              />
            </div>
            {renameError ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {renameError}
              </p>
            ) : null}
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
                disabled={
                  renameBusy ||
                  renameValue.trim().slice(0, DISPLAY_NAME_MAX) ===
                    (row.display_name?.trim() ?? "")
                }
                onClick={() => void saveRename()}
              >
                {renameBusy ? "Saving…" : "Save"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
