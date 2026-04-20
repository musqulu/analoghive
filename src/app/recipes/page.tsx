import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ButtonLink } from "@/components/landing/button"
import { Container } from "@/components/landing/container"
import { RecipesList } from "@/components/recipes/recipes-list"
import {
  DEVELOPMENT_RECIPES_LIST_COLUMNS,
  recipeRowFromDb,
  type DevelopmentRecipeRow,
} from "@/types/recipe"

export const metadata: Metadata = {
  title: "Recipes — Analog Hive",
  description: "Your saved film development recipes.",
}

export default async function RecipesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/recipes")
  }

  const { data } = await supabase
    .from("development_recipes")
    .select(DEVELOPMENT_RECIPES_LIST_COLUMNS)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  const rows = (data ?? [])
    .map((r) => recipeRowFromDb(r as Parameters<typeof recipeRowFromDb>[0]))
    .filter((r): r is DevelopmentRecipeRow => r !== null)

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-background py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-foreground">
            Recipes
          </h1>
          <p className="mb-10 text-base/7 text-muted-foreground">
            Your personal development recipes — times, wash steps, and notes you’ve customized. For
            quick links back to chart combinations, use{" "}
            <Link href="/favorites" className="font-medium text-foreground underline-offset-4 hover:underline">
              Favorites
            </Link>
            .
          </p>

          <div className="mb-8">
            <ButtonLink href="/recipes/new" color="dark/light" size="md">
              New recipe
            </ButtonLink>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-lg bg-card p-10 shadow-ds-card-lg">
              <h2 className="mb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
                No recipes yet
              </h2>
              <p className="mb-8 max-w-md text-base/7 text-muted-foreground">
                Create a recipe from the calculator or start from scratch on your dashboard. Recipes
                are your editable darkroom notebook — unlike favorites, which bookmark chart
                references.
              </p>
              <ButtonLink href="/recipes/new" color="dark/light" size="md">
                New recipe
              </ButtonLink>
            </div>
          ) : (
            <RecipesList initialRows={rows} />
          )}
        </div>
      </Container>
    </main>
  )
}
