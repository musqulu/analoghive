import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ButtonLink } from "@/components/landing/button"
import { Container } from "@/components/landing/container"
import { FavoritesList } from "@/components/favorites-list"
import type { DevelopmentFavoriteRow } from "@/types/favorite"

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
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const rows = (data ?? []) as DevelopmentFavoriteRow[]

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-background py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-foreground">
            Favorites
          </h1>
          <p className="mb-10 text-base/7 text-muted-foreground">
            Saved development setups from the calculator — quick access for your next roll.
          </p>

          {rows.length === 0 ? (
            <div className="rounded-lg bg-card p-10 shadow-ds-card-lg">
              <h2 className="mb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
                No favorites yet
              </h2>
              <p className="mb-8 max-w-md text-base/7 text-muted-foreground">
                When you dial in a film and developer on the calculator, save it here and open it
                again anytime — handy when you&apos;re back in the darkroom with the same stock.
              </p>
              <ButtonLink href="/develop" color="dark/light" size="md">
                Go to calculator
              </ButtonLink>
            </div>
          ) : (
            <FavoritesList initialRows={rows} />
          )}
        </div>
      </Container>
    </main>
  )
}
