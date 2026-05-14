import { createClient } from "@/lib/supabase/client"

export async function updateDiaryEntry(params: {
  id: string
  title: string | null
  notes: string | null
}): Promise<boolean> {
  const { id, title, notes } = params
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("development_log_entries")
      .update({
        title: title?.trim() || null,
        notes: notes?.trim() || null,
      })
      .eq("id", id)
      .select("id")
      .single()

    if (error || !data?.id) {
      console.warn("[diary] update failed:", error?.message ?? "missing id")
      return false
    }
    return true
  } catch (e) {
    console.warn("[diary] update failed:", e instanceof Error ? e.message : e)
    return false
  }
}

export async function deleteDevelopmentLogEntry(id: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("development_log_entries").delete().eq("id", id)
    if (error) {
      console.warn("[diary] delete failed:", error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn("[diary] delete failed:", e instanceof Error ? e.message : e)
    return false
  }
}
