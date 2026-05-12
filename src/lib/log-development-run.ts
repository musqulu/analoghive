import { createClient } from "@/lib/supabase/client"
import type { DevelopmentLogInsert } from "@/types/development-log"

/**
 * Inserts into `development_log_entries` after the timer's dev step completes.
 * Resolves the current user from the browser session and returns null if there
 * is no session (the calculator is usable while signed out). Errors are logged
 * but not surfaced to the UI — the timer keeps advancing regardless.
 */
export async function logDevelopmentRun(
  entry: Omit<DevelopmentLogInsert, "user_id">,
): Promise<{ id: string } | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) {
      console.warn("[darkroom-log] user lookup failed:", userError.message)
      return null
    }
    if (!user) return null

    const { data, error } = await supabase
      .from("development_log_entries")
      .insert({ ...entry, user_id: user.id })
      .select("id")
      .single()

    if (error || !data?.id) {
      console.warn("[darkroom-log] insert failed:", error?.message ?? "missing id")
      return null
    }
    return { id: data.id }
  } catch (error) {
    console.warn(
      "[darkroom-log] insert failed:",
      error instanceof Error ? error.message : error,
    )
    return null
  }
}
