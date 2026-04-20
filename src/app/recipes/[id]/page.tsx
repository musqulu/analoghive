import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Container } from "@/components/landing/container"
import { RecipeDetailClient } from "@/components/recipes/recipe-detail-client"
import {
  DEVELOPMENT_RECIPES_LIST_COLUMNS,
  parseRecipePayload,
} from "@/types/recipe"

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await params
  return {
    title: "Recipe — Analog Hive",
    description: "Your saved film development recipe.",
  }
}

export default async function RecipeDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/recipes/${id}`)}`)
  }

  const { data, error } = await supabase
    .from("development_recipes")
    .select(DEVELOPMENT_RECIPES_LIST_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !data) {
    notFound()
  }

  const payload = parseRecipePayload(data.payload)
  if (!payload) {
    notFound()
  }

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-background py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-md">
          <div className="mb-8">
            <Link
              href="/recipes"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← All recipes
            </Link>
          </div>
          <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight text-foreground">
            {data.title}
          </h1>
          <RecipeDetailClient recipeId={id} payload={payload} />
        </div>
      </Container>
    </main>
  )
}
