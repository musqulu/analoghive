import type { Metadata } from "next"
import { redirect } from "next/navigation"
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
              Nothing saved yet
            </h2>
            <p className="mb-8 max-w-md text-base/7 text-muted-foreground">
              Custom development times, notes, and presets will show up here. This is a temporary
              empty state until those features ship.
            </p>
            <ButtonLink href="/develop" color="dark/light" size="md">
              Open calculator
            </ButtonLink>
          </div>
        </div>
      </Container>
    </main>
  )
}
