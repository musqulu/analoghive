import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Container } from "./container"
import { Subheading } from "./subheading"
import { Eyebrow } from "./eyebrow"
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid"

interface Feature {
  icon: ReactNode
  title: string
  description: string
  href: string
  cta: string
}

/** Responsive spans for a 5-card bento on a 3-column (lg+) / 2-column (sm–lg) grid. */
const FEATURE_CARD_LAYOUT = [
  "col-span-2 max-sm:col-span-1 sm:max-lg:col-span-2",
  "col-span-1 max-sm:col-span-1",
  "col-span-1 max-sm:col-span-1",
  "col-span-1 max-sm:col-span-1",
  "col-span-1 max-sm:col-span-1",
] as const

export function Features({
  eyebrow,
  headline,
  features,
  className,
  ...props
}: {
  eyebrow?: ReactNode
  headline: ReactNode
  features: Feature[]
} & ComponentProps<"section">) {
  return (
    <section className={cn("py-16", className)} {...props}>
      <Container>
        <div className="flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <Subheading className="max-w-2xl text-center">{headline}</Subheading>
          </div>
          <BentoGrid className="max-sm:grid-cols-1 sm:max-lg:grid-cols-2">
            {features.map((feature, i) => (
              <BentoCard
                key={feature.title}
                className={FEATURE_CARD_LAYOUT[i] ?? "col-span-1 max-sm:col-span-1"}
                Icon={feature.icon}
                name={feature.title}
                description={feature.description}
                href={feature.href}
                cta={feature.cta}
              />
            ))}
          </BentoGrid>
        </div>
      </Container>
    </section>
  )
}
