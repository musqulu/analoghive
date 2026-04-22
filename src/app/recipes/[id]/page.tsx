import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Container } from "@/components/landing/container"
import { cn } from "@/lib/utils"
import { mainUnderNav, pageTitle } from "@/lib/app-page-layout"
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
    <main className={mainUnderNav}>
      <Container>
        <div className="mx-auto max-w-md">
          <div className="mb-3">
            <Link
              href="/recipes"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← All recipes
            </Link>
          </div>
          <h1 className={cn("mb-8 text-center", pageTitle)}>{data.title}</h1>
          <RecipeDetailClient recipeId={id} payload={payload} />
        </div>
      </Container>
    </main>
  )
}
