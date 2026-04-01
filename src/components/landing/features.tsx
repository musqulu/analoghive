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
          <BentoGrid className="max-sm:grid-cols-1 sm:max-lg:grid-cols-2">
            <BentoCard className="col-span-2 max-sm:col-span-1 sm:max-lg:col-span-1" Icon={features[0].icon} name={features[0].title} description={features[0].description} />
            <BentoCard className="col-span-1" Icon={features[1].icon} name={features[1].title} description={features[1].description} />
            <BentoCard className="col-span-1" Icon={features[2].icon} name={features[2].title} description={features[2].description} />
            <BentoCard className="col-span-2 max-sm:col-span-1 sm:max-lg:col-span-1" Icon={features[3].icon} name={features[3].title} description={features[3].description} />
          </BentoGrid>
        </div>
      </Container>
    </section>
  )
}
