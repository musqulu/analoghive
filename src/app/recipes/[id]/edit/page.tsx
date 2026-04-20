import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Container } from "@/components/landing/container"
import { RecipeEditForm } from "@/components/recipes/recipe-edit-form"
import { DEVELOPMENT_RECIPES_LIST_COLUMNS, parseRecipePayload } from "@/types/recipe"

type Params = Promise<{ id: string }>

export const metadata: Metadata = {
  title: "Edit recipe — Analog Hive",
  description: "Edit your film development recipe.",
}

export default async function EditRecipePage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/recipes/${id}/edit`)}`)
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
              href={`/recipes/${id}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to recipe
            </Link>
          </div>
          <RecipeEditForm
            key={id}
            mode="edit"
            recipeId={id}
            defaultPayload={payload}
            savedTitle={data.title}
          />
        </div>
      </Container>
    </main>
  )
}
