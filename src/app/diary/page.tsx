import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Container } from "@/components/landing/container"
import { DiaryList } from "@/components/development-diary/diary-list"
import { mainUnderNav, pageTitle } from "@/lib/app-page-layout"
import {
  DEVELOPMENT_LOG_LIST_COLUMNS,
  type DevelopmentLogEntryRow,
} from "@/types/development-log"

const DIARY_FETCH_LIMIT = 100

export const metadata: Metadata = {
  title: "Development Diary — Analog Hive",
  description: "Your recent film developments — titles and notes beside each timed run.",
}

export default async function DiaryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login?next=/diary")

  const { data, error } = await supabase
    .from("development_log_entries")
    .select(DEVELOPMENT_LOG_LIST_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(DIARY_FETCH_LIMIT)

  if (error) {
    return (
      <main className={mainUnderNav}>
        <Container>
          <div className="mx-auto max-w-xl text-center text-sm text-muted-foreground">
            <p className="text-destructive">Could not load diary.</p>
          </div>
        </Container>
      </main>
    )
  }

  const entries = (data ?? []) as DevelopmentLogEntryRow[]

  return (
    <main className={mainUnderNav}>
      <Container>
        <div className="mx-auto max-w-2xl space-y-8">
          <h1 className={pageTitle}>Development diary</h1>
          <DiaryList entries={entries} />
        </div>
      </Container>
    </main>
  )
}
