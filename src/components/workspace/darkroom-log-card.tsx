import type { DarkroomStats } from "@/lib/darkroom-stats"

interface DarkroomLogCardProps {
  stats: DarkroomStats
}

export function DarkroomLogCard({ stats }: DarkroomLogCardProps) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Rolls developed", value: String(stats.rollsDeveloped) },
    { label: "Sheets developed", value: String(stats.sheetsDeveloped) },
    { label: "Custom recipes", value: String(stats.customRecipes) },
    { label: "Most used developer", value: stats.mostUsedDeveloper ?? "—" },
    { label: "Most used film", value: stats.mostUsedFilm ?? "—" },
  ]

  return (
    <section className="rounded-lg bg-card p-6 shadow-ds-card-lg sm:p-8">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
        Darkroom log
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        A running tally of every roll and sheet you&rsquo;ve developed with the timer.
      </p>
      <dl className="mt-5 divide-y divide-border border-y border-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-sm font-semibold tabular-nums text-foreground sm:text-base">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
