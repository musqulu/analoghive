import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ButtonLink } from "@/components/landing/button"
import { Container } from "@/components/landing/container"
import { cn } from "@/lib/utils"
import { mainUnderNav, pageTitle } from "@/lib/app-page-layout"
import { RecipesPageEmpty } from "@/components/recipes/recipes-page-empty"
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

  const isEmpty = rows.length === 0

  return (
    <main className={mainUnderNav}>
      <Container>
        <div className="mx-auto max-w-2xl">
          {isEmpty ? (
            <>
              <h1 className={cn(pageTitle, "mb-5")}>Recipes</h1>
              <RecipesPageEmpty />
            </>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <h1 className={pageTitle}>Recipes</h1>
                <ButtonLink href="/recipes/new" color="dark/light" size="md">
                  New recipe
                </ButtonLink>
              </div>
              <p className="mb-10 text-base/7 text-muted-foreground">
                Fully customised development recipes.
              </p>
              <RecipesList initialRows={rows} />
            </>
          )}
        </div>
      </Container>
    </main>
  )
}
