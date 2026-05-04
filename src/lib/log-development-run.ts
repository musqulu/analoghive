import { createClient } from "@/lib/supabase/client"
import type { DevelopmentLogInsert } from "@/types/development-log"

/**
 * Inserts into `development_log_entries` after the timer's dev step completes.
 * Resolves the current user from the browser session and returns false if there
 * is no session (the calculator is usable while signed out). Errors are logged
 * but not surfaced to the UI — the timer keeps advancing regardless.
 */
export async function logDevelopmentRun(
  entry: Omit<DevelopmentLogInsert, "user_id">,
): Promise<boolean> {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) {
      console.warn("[darkroom-log] user lookup failed:", userError.message)
      return false
    }
    if (!user) return false

    const { error } = await supabase
      .from("development_log_entries")
      .insert({ ...entry, user_id: user.id })

    if (error) {
      console.warn("[darkroom-log] insert failed:", error.message)
      return false
    }
    return true
  } catch (error) {
    console.warn(
      "[darkroom-log] insert failed:",
      error instanceof Error ? error.message : error,
    )
    return false
  }
}
