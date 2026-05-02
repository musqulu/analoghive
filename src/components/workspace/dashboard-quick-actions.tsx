import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Film, FlaskConical, ScrollText, Thermometer } from "lucide-react"
import { cn } from "@/lib/utils"

const ACTIONS: Array<{ href: string; label: string; Icon: LucideIcon }> = [
  { href: "/develop", label: "Develop film", Icon: Film },
  { href: "/recipes/new", label: "New recipe", Icon: ScrollText },
  { href: "/tools/temperature-correction", label: "Temperature correction", Icon: Thermometer },
  { href: "/tools/volume-mixer", label: "Volume mixer", Icon: FlaskConical },
]

const cardClass =
  "flex min-h-[6.5rem] min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-ds-card outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-4"

const iconWrapClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground"

/**
 * Four tappable shortcuts above the Darkroom log. Icon slot uses Lucide for now;
 * swap the inner content of the icon wrap for <Image /> when assets are ready.
 */
export function DashboardQuickActions() {
  return (
    <section className="space-y-3" aria-labelledby="dashboard-quick-actions-heading">
      <h2 id="dashboard-quick-actions-heading" className="sr-only">
        Quick actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={cardClass}>
            <span className={iconWrapClass} aria-hidden>
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span
              className={cn(
                "text-center text-xs font-medium leading-snug text-foreground sm:text-sm",
              )}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
