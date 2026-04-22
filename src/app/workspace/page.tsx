import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ButtonLink } from "@/components/landing/button"
import { Container } from "@/components/landing/container"
import { cn } from "@/lib/utils"
import { mainUnderNav, pageTitle } from "@/lib/app-page-layout"
import { WorkspaceDashboardEmpty } from "@/components/workspace/workspace-dashboard-empty"

export const metadata: Metadata = {
  title: "Dashboard — Analog Hive",
  description: "Your saved film development dashboard.",
}

export default async function WorkspacePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/workspace")
  }

  const [recipesCountResult, favoritesCountResult] = await Promise.all([
    supabase
      .from("development_recipes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("development_favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ])

  const recipeCount = recipesCountResult.count ?? 0
  const favoriteCount = favoritesCountResult.count ?? 0
  const showDashboardEmpty = recipeCount === 0 && favoriteCount === 0

  return (
    <main className={mainUnderNav}>
      <Container>
        <div className="mx-auto max-w-2xl">
          <h1 className={cn(pageTitle, showDashboardEmpty ? "mb-2" : "mb-3")}>Dashboard</h1>
          <p
            className={
              showDashboardEmpty
                ? "mb-5 text-sm text-muted-foreground"
                : "mb-10 text-sm text-muted-foreground"
            }
          >
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>

          {showDashboardEmpty ? (
            <WorkspaceDashboardEmpty />
          ) : (
            <div className="rounded-lg bg-card p-10 shadow-ds-card-lg">
              <h2 className="mb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
                Your darkroom
              </h2>
              <p className="mb-8 max-w-lg text-base/7 text-muted-foreground">
                <span className="font-medium text-foreground">Favorites</span> bookmark chart
                combinations for quick access.{" "}
                <span className="font-medium text-foreground">Recipes</span> are your own editable
                workflows — times, wash steps, and notes you can change anytime.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href="/recipes/new" color="dark/light" size="md">
                  New recipe
                </ButtonLink>
                <ButtonLink href="/develop" color="light" size="md">
                  Open calculator
                </ButtonLink>
                <ButtonLink href="/recipes" color="light" size="md">
                  All recipes
                </ButtonLink>
              </div>
              <p className="mt-8 text-sm text-muted-foreground">
                <Link href="/favorites" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Favorites
                </Link>
                {" · "}
                <Link href="/recipes" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Recipes
                </Link>
              </p>
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}
