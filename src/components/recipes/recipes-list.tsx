"use client"

import { RecipeCard } from "@/components/recipes/recipe-card"
import type { DevelopmentRecipeRow } from "@/types/recipe"

export function RecipesList({ initialRows }: { initialRows: DevelopmentRecipeRow[] }) {
  return (
    <div className="flex flex-col gap-4">
      {initialRows.map((row) => (
        <RecipeCard key={row.id} row={row} />
      ))}
    </div>
  )
}
