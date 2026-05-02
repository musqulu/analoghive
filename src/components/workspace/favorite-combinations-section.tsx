"use client"

import * as React from "react"
import { FavoriteCard } from "@/components/favorite-card"
import { ButtonLink } from "@/components/landing/button"
import type { DevelopmentFavoriteRow } from "@/types/favorite"

/**
 * Dashboard "Favorite chart combinations" — renders the latest 2 favorites using
 * the same FavoriteCard the /favorites page uses. Local state mirrors
 * `favorites-list.tsx` for optimistic delete/rename.
 */
export function FavoriteCombinationsSection({
  initialRows,
}: {
  initialRows: DevelopmentFavoriteRow[]
}) {
  const [rows, setRows] = React.useState(initialRows)

  const handleDeleted = React.useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const handleRestore = React.useCallback((row: DevelopmentFavoriteRow) => {
    setRows((prev) => {
      if (prev.some((r) => r.id === row.id)) return prev
      return [...prev, row].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    })
  }, [])

  const handleRenamed = React.useCallback(
    (id: string, next: DevelopmentFavoriteRow) => {
      setRows((prev) => prev.map((r) => (r.id === id ? next : r)))
    },
    [],
  )

  if (rows.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
        Favorite chart combinations
      </h2>
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <FavoriteCard
            key={row.id}
            row={row}
            onDeleted={handleDeleted}
            onRestore={handleRestore}
            onRenamed={handleRenamed}
          />
        ))}
      </div>
      <div>
        <ButtonLink href="/favorites" color="light" size="md">
          {"View all chart combinations ->"}
        </ButtonLink>
      </div>
    </section>
  )
}
