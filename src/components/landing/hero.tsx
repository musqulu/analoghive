import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Container } from "./container"
import { Heading } from "./heading"
import { Text } from "./text"

export function Hero({
  eyebrow,
  headline,
  subheadline,
  cta,
  demo,
  footer,
  className,
  ...props
}: {
  eyebrow?: ReactNode
  headline: ReactNode
  subheadline: ReactNode
  cta?: ReactNode
  demo?: ReactNode
  footer?: ReactNode
} & ComponentProps<"section">) {
  return (
    <section className={cn("py-24 sm:py-32", className)} {...props}>
      <Container className="flex flex-col gap-16">
        <div className="flex flex-col items-center gap-16">
          <div className="flex flex-col items-center gap-8 text-center">
            {eyebrow}
            <Heading className="max-w-4xl text-center">{headline}</Heading>
            <Text size="lg" className="max-w-xl text-center">
              {subheadline}
            </Text>
            {cta && <div className="flex flex-wrap items-center justify-center gap-4 pt-2">{cta}</div>}
          </div>
          {demo}
        </div>
        {footer}
      </Container>
    </section>
  )
}
