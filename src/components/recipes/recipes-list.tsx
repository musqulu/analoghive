"use client"

import * as React from "react"
import { RecipeCard } from "@/components/recipes/recipe-card"
import type { DevelopmentRecipeRow } from "@/types/recipe"

export function RecipesList({ initialRows }: { initialRows: DevelopmentRecipeRow[] }) {
  const [rows, setRows] = React.useState(initialRows)

  const handleDeleted = React.useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const handleRestore = React.useCallback((row: DevelopmentRecipeRow) => {
    setRows((prev) => {
      if (prev.some((r) => r.id === row.id)) return prev
      return [...prev, row].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
    })
  }, [])

  const handleRenamed = React.useCallback((id: string, next: DevelopmentRecipeRow) => {
    setRows((prev) => {
      const mapped = prev.map((r) => (r.id === id ? next : r))
      return [...mapped].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
    })
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <RecipeCard
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
