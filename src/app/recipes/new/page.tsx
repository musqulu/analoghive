import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Container } from "@/components/landing/container"
import { mainUnderNav } from "@/lib/app-page-layout"
import { RecipeNewClient } from "@/components/recipes/recipe-edit-form"

export const metadata: Metadata = {
  title: "New recipe — Analog Hive",
  description: "Create a personal film development recipe.",
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function RecipeNewFallback() {
  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="h-10 w-48 rounded-md bg-muted" />
      <div className="h-24 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  )
}

export default async function NewRecipePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, v))
    } else {
      sp.set(key, value)
    }
  }
  const qs = sp.toString()
  const nextPath = qs ? `/recipes/new?${qs}` : "/recipes/new"

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  }

  return (
    <main className={mainUnderNav}>
      <Container>
        <Suspense fallback={<RecipeNewFallback />}>
          <RecipeNewClient />
        </Suspense>
      </Container>
    </main>
  )
}
