"use client"

import Link from "next/link"
import type { DevelopmentRecipeRow } from "@/types/recipe"

export function RecipeCard({ row }: { row: DevelopmentRecipeRow }) {
  const p = row.payload
  const sub = [p.identity.filmName, p.identity.developerName].filter(Boolean).join(" · ")

  return (
    <div className="flex min-w-0 items-start justify-between rounded-lg bg-card p-4 ds-card">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-medium">{row.title}</p>
        {sub ? <p className="text-sm text-muted-foreground">{sub}</p> : null}
        <p className="text-xs text-muted-foreground">
          Updated{" "}
          {new Date(row.updated_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
      <Link
        href={`/recipes/${row.id}`}
        className="ml-4 shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Open
      </Link>
    </div>
  )
}
