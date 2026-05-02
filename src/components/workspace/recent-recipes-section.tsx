"use client"

import * as React from "react"
import { RecipeCard } from "@/components/recipes/recipe-card"
import { ButtonLink } from "@/components/landing/button"
import type { DevelopmentRecipeRow } from "@/types/recipe"

/**
 * Dashboard "Recent recipes" — renders the latest 2 saved recipes using the same
 * RecipeCard the /recipes page uses. Local state mirrors `recipes-list.tsx` so
 * delete/rename optimistic updates work without a refetch.
 */
export function RecentRecipesSection({
  initialRows,
}: {
  initialRows: DevelopmentRecipeRow[]
}) {
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

  const handleRenamed = React.useCallback(
    (id: string, next: DevelopmentRecipeRow) => {
      setRows((prev) =>
        prev
          .map((r) => (r.id === id ? next : r))
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          ),
      )
    },
    [],
  )

  if (rows.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
        Recent recipes
      </h2>
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
      <div>
        <ButtonLink href="/recipes" color="light" size="md">
          {"View all recipes ->"}
        </ButtonLink>
      </div>
    </section>
  )
}
