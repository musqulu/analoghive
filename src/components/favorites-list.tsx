"use client"

import * as React from "react"
import { FavoriteCard } from "@/components/favorite-card"
import type { DevelopmentFavoriteRow } from "@/types/favorite"

export function FavoritesList({ initialRows }: { initialRows: DevelopmentFavoriteRow[] }) {
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

  const handleRenamed = React.useCallback((id: string, next: DevelopmentFavoriteRow) => {
    setRows((prev) => prev.map((r) => (r.id === id ? next : r)))
  }, [])

  return (
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
  )
}
