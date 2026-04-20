import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ButtonLink } from "@/components/landing/button"
import { Container } from "@/components/landing/container"

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

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-background py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-3 text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-foreground">
            Dashboard
          </h1>
          <p className="mb-10 text-base/7 text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>

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
        </div>
      </Container>
    </main>
  )
}
