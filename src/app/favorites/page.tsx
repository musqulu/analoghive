import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ButtonLink } from "@/components/landing/button"
import { Container } from "@/components/landing/container"
import { cn } from "@/lib/utils"
import { mainUnderNav, pageTitle } from "@/lib/app-page-layout"
import { FavoritesPageEmpty } from "@/components/favorites-page-empty"
import { FavoritesList } from "@/components/favorites-list"
import {
  DEVELOPMENT_FAVORITES_LIST_COLUMNS,
  type DevelopmentFavoriteRow,
} from "@/types/favorite"

export const metadata: Metadata = {
  title: "Favorites — Analog Hive",
  description: "Saved film and developer combinations from the calculator.",
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/favorites")
  }

  const { data } = await supabase
    .from("development_favorites")
    .select(DEVELOPMENT_FAVORITES_LIST_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const rows = (data ?? []) as DevelopmentFavoriteRow[]

  const isEmpty = rows.length === 0

  return (
    <main className={mainUnderNav}>
      <Container>
        <div className="mx-auto max-w-2xl">
          {isEmpty ? (
            <>
              <h1 className={cn(pageTitle, "mb-5")}>Favorites</h1>
              <FavoritesPageEmpty />
            </>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <h1 className={pageTitle}>Favorites</h1>
                <ButtonLink href="/develop" color="dark/light" size="md">
                  Develop Film
                </ButtonLink>
              </div>
              <p className="mb-10 text-base/7 text-muted-foreground">
                Saved film and developer combinations from the calculator.
              </p>

              <FavoritesList initialRows={rows} />
            </>
          )}
        </div>
      </Container>
    </main>
  )
}
