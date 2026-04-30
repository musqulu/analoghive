"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { FilmFormatIcon } from "@/components/film-format-icon"
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
import {
  LISTING_CARD_DIVIDER,
  LISTING_CARD_ICON_WRAP,
  LISTING_CARD_OPEN_LINK,
  LISTING_CARD_PILL,
  LISTING_CARD_ROOT,
} from "@/constants/listing-card-classes"

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
  const tempSuffix = row.temperature_unit === "celsius" ? "°C" : "°F"

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

  const dilutionDisplay = normalizeDilutionDisplay(dilution)
  const pills = [
    row.film_format,
    `ISO ${row.film_iso}`,
    `${row.modified_temperature}${tempSuffix}`,
    `${row.total_volume} ml`,
    dilutionDisplay,
  ]

  return (
    <div className={LISTING_CARD_ROOT}>
      <div className="flex items-start justify-between gap-3">
        <div className={LISTING_CARD_ICON_WRAP} aria-hidden>
          <FilmFormatIcon format={row.film_format} className="h-5 w-5" />
        </div>
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger
            type="button"
            disabled={busy}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-3 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50"
            aria-label="Favorite actions"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-ds-card"
              align="end"
              sideOffset={6}
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
                onSelect={() => setRenameOpen(true)}
              >
                <Pencil className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                Rename
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm text-destructive outline-none data-[highlighted]:bg-muted data-[highlighted]:text-destructive"
                disabled={busy}
                onSelect={() => void remove()}
              >
                <Trash2 className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="mt-5 flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="font-semibold text-foreground">{row.film_name}</p>
          <p className="text-sm tabular-nums text-muted-foreground">{timeDisplay}</p>
        </div>
        <p className="break-words text-xl font-semibold leading-snug tracking-tight text-foreground">
          {title}
        </p>
        <div className="flex flex-wrap gap-2">
          {pills.map((label, index) => (
            <span
              key={`${row.id}-${index}`}
              className={LISTING_CARD_PILL}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className={LISTING_CARD_DIVIDER} />

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-base font-semibold text-foreground">{row.developer_name}</p>
          <p className="text-sm leading-snug text-muted-foreground">
            {row.film_name} ({row.film_format}) · {dilutionDisplay}
          </p>
        </div>
        <Link href={href} className={LISTING_CARD_OPEN_LINK}>
          Open
        </Link>
      </div>

      <Dialog.Root open={renameOpen} onOpenChange={setRenameOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[50] bg-black/40 data-[state=closed]:pointer-events-none data-[state=open]:pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[50] w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-ds-card outline-none data-[state=closed]:pointer-events-none data-[state=open]:pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out">
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
