import { createClient } from "@/lib/supabase/client"
import type { DevelopmentLogInsert } from "@/types/development-log"

/**
 * Fire-and-forget insert into `development_log_entries` after the timer's dev step
 * completes. Resolves the current user from the browser session and bails silently
 * if there is no session (the calculator is usable while signed out). Errors are
 * logged but not surfaced to the UI — the timer keeps advancing regardless.
 */
export async function logDevelopmentRun(
  entry: Omit<DevelopmentLogInsert, "user_id">,
): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from("development_log_entries")
    .insert({ ...entry, user_id: user.id })

  if (error) {
    console.warn("[darkroom-log] insert failed:", error.message)
  }
}
