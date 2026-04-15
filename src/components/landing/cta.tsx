import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Container } from "./container"
import { Subheading } from "./subheading"
import { Text } from "./text"

export function CTA({
  headline,
  subheadline,
  cta,
  className,
  ...props
}: {
  headline: ReactNode
  subheadline?: ReactNode
  cta?: ReactNode
} & ComponentProps<"section">) {
  return (
    <section className={cn("py-16", className)} {...props}>
      <Container>
        <div className="rounded-xl bg-primary px-8 py-16 text-center">
          <div className="flex flex-col items-center gap-6">
            <Subheading color="light" className="max-w-xl">
              {headline}
            </Subheading>
            {subheadline && (
              <Text className="max-w-md text-primary-foreground/80">{subheadline}</Text>
            )}
            {cta && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {cta}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
