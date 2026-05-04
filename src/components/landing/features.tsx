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
          <BentoGrid className="grid-cols-1 sm:grid-cols-2">
            {features.map((feature) => (
              <BentoCard
                key={feature.title}
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
