"use client"

import * as React from "react"
import { FavoriteCard } from "@/components/favorite-card"
import type { DevelopmentFavoriteRow } from "@/types/favorite"

export function FavoritesList({ initialRows }: { initialRows: DevelopmentFavoriteRow[] }) {
  const [rows, setRows] = React.useState(initialRows)

  const handleDeleted = React.useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const handleRenamed = React.useCallback((id: string, next: DevelopmentFavoriteRow) => {
    setRows((prev) => prev.map((r) => (r.id === id ? next : r)))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <FavoriteCard key={row.id} row={row} onDeleted={handleDeleted} onRenamed={handleRenamed} />
      ))}
    </div>
  )
}
