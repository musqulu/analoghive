import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Container } from "@/components/landing/container"
import { cn } from "@/lib/utils"
import { mainUnderNav, pageTitle } from "@/lib/app-page-layout"
import { WorkspaceDashboardEmpty } from "@/components/workspace/workspace-dashboard-empty"
import { DashboardQuickActions } from "@/components/workspace/dashboard-quick-actions"
import { DarkroomLogCard } from "@/components/workspace/darkroom-log-card"
import { RecentRecipesSection } from "@/components/workspace/recent-recipes-section"
import { FavoriteCombinationsSection } from "@/components/workspace/favorite-combinations-section"
import { getDarkroomStats } from "@/lib/darkroom-stats"
import {
  DEVELOPMENT_RECIPES_LIST_COLUMNS,
  recipeRowFromDb,
  type DevelopmentRecipeRow,
} from "@/types/recipe"
import {
  DEVELOPMENT_FAVORITES_LIST_COLUMNS,
  type DevelopmentFavoriteRow,
} from "@/types/favorite"

const RECENT_LIMIT = 2

export const metadata: Metadata = {
  title: "Dashboard — Analog Hive",
  description: "Your darkroom log, recent recipes, and favorite chart combinations.",
}

export default async function WorkspacePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/workspace")
  }

  const [recentRecipesResult, recentFavoritesResult, logCountResult, stats] =
    await Promise.all([
      supabase
        .from("development_recipes")
        .select(DEVELOPMENT_RECIPES_LIST_COLUMNS)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(RECENT_LIMIT),
      supabase
        .from("development_favorites")
        .select(DEVELOPMENT_FAVORITES_LIST_COLUMNS)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(RECENT_LIMIT),
      supabase
        .from("development_log_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      getDarkroomStats(supabase, user.id),
    ])

  const recentRecipes = (recentRecipesResult.data ?? [])
    .map((r) => recipeRowFromDb(r as Parameters<typeof recipeRowFromDb>[0]))
    .filter((r): r is DevelopmentRecipeRow => r !== null)
  const recentFavorites = (recentFavoritesResult.data ?? []) as DevelopmentFavoriteRow[]
  const logCount = logCountResult.count ?? 0

  const showDashboardEmpty =
    stats.customRecipes === 0 && recentFavorites.length === 0 && logCount === 0

  return (
    <main className={mainUnderNav}>
      <Container>
        <div className="mx-auto max-w-2xl">
          <h1 className={cn(pageTitle, showDashboardEmpty ? "mb-2" : "mb-3")}>Dashboard</h1>
          <p
            className={
              showDashboardEmpty
                ? "mb-5 text-sm text-muted-foreground"
                : "mb-8 text-sm text-muted-foreground"
            }
          >
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>

          {showDashboardEmpty ? (
            <WorkspaceDashboardEmpty />
          ) : (
            <div className="space-y-8">
              <DashboardQuickActions />
              <DarkroomLogCard stats={stats} />
              <RecentRecipesSection initialRows={recentRecipes} />
              <FavoriteCombinationsSection initialRows={recentFavorites} />
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}
