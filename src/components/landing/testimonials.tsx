import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Container } from "./container"
import { Subheading } from "./subheading"
import { Text } from "./text"

const testimonials = [
  {
    quote:
      "Having the timer and calculator in one place is great, but the chat actually explained push processing in terms I could use at the sink.",
    name: "Clara M.",
    role: "Street photographer",
  },
  {
    quote:
      "It feels less like a random app and more like something that stays with you through a whole development night.",
    name: "James R.",
    role: "Black & white lab hobbyist",
  },
] as const

export function Testimonials({ className, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("py-16", className)} {...props}>
      <Container>
        <div className="flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <Subheading className="max-w-2xl">Testimonials</Subheading>
          </div>
          <ul className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-2">
            {testimonials.map((t) => (
              <li
                key={t.name}
                className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 ds-card"
              >
                <blockquote>
                  <Text className="text-foreground">“{t.quote}”</Text>
                </blockquote>
                <footer className="mt-auto pt-2 text-sm">
                  <cite className="not-italic font-semibold text-foreground">{t.name}</cite>
                  <p className="text-muted-foreground">{t.role}</p>
                </footer>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
