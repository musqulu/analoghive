import type { ComponentProps } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Container } from "./container"
import { Subheading } from "./subheading"
import { Text } from "./text"

const faqItems = [
  {
    q: "What is Analog Hive?",
    a: "Analog Hive is a modern darkroom companion: calculators, timers, and saved recipes paired with conversational help so you are not juggling tabs or guesswork at the sink.",
  },
  {
    q: "How does the darkroom companion (AI) help?",
    a: "You can chat in plain language to clarify steps, chemistry, or timing. It stays alongside your workflow and can explain concepts as you go, not just spit out numbers.",
  },
  {
    q: "Does the companion remember context?",
    a: "With an account, it can retain context across your session—what recipe you chose, corrections you applied, or steps you completed—so follow-up questions stay relevant.",
  },
  {
    q: "Can I use it without an account?",
    a: "Yes. Jump into the calculator and timer anytime. Signing up unlocks favorites, custom recipes, and the companion tied to your saved workflow.",
  },
  {
    q: "Who can see my data?",
    a: "Your favorites, recipes, and companion activity stay private to your account. They aren't shown on public pages alongside other people's work.",
  },
] as const

export function FAQ({ className, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("py-16", className)} {...props}>
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col gap-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <Subheading className="max-w-xl">Frequently asked questions</Subheading>
          </div>
          <div className="flex flex-col gap-2">
            {faqItems.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-lg border border-border bg-card px-5 py-1 ds-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-lg font-semibold tracking-[-0.06em] text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <ChevronDown
                    size={20}
                    className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="border-t border-border pb-4 pt-1">
                  <Text>{a}</Text>
                </div>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
