import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
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
          <h1 className={cn(pageTitle, isEmpty ? "mb-5" : "mb-3")}>Recipes</h1>

          {isEmpty ? (
            <RecipesPageEmpty />
          ) : (
            <>
              <p className="mb-10 text-base/7 text-muted-foreground">
                Your personal development recipes — times, wash steps, and notes you’ve customized.
                For quick links back to chart combinations, use{" "}
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

              <RecipesList initialRows={rows} />
            </>
          )}
        </div>
      </Container>
    </main>
  )
}
