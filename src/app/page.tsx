import { Clock, Thermometer, FlaskConical, Calculator, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { SpinningText } from "@/components/magicui/spinning-text"
import { Eyebrow } from "@/components/landing/eyebrow"
import { ButtonLink } from "@/components/landing/button"
import { AnimatedGradientText } from "@/registry/magicui/animated-gradient-text"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: <Calculator size={20} />,
    title: "Development Calculator",
    description:
      "Look up precise development times for hundreds of film and developer combinations, with push/pull adjustments.",
  },
  {
    icon: <Clock size={20} />,
    title: "Darkroom Timer",
    description:
      "Step-by-step agitation cues and a full-screen darkroom mode keep you on track from start to finish.",
  },
  {
    icon: <Thermometer size={20} />,
    title: "Temperature Correction",
    description:
      "Automatically adjust development times when your tank isn't at box temperature.",
  },
  {
    icon: <FlaskConical size={20} />,
    title: "Volume Mixer",
    description:
      "Calculate exact developer and water volumes for any dilution ratio and tank size.",
  },
]

export default function Home() {
  return (
    <main>
      <Hero
        eyebrow={<Eyebrow>Analog Film Development</Eyebrow>}
        headline="Calculate. Develop. Perfect."
        subheadline="Precise development times, temperature correction, and volume mixing for analog film — all in one place."
        cta={
          <Link
            href="/develop"
            className="group relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]"
          >
            <span
              className={cn(
                "animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
              )}
              style={{
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "destination-out",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "subtract",
                WebkitClipPath: "padding-box",
              }}
            />
            <AnimatedGradientText className="text-sm font-medium">
              Start Developing
            </AnimatedGradientText>
            <ChevronRight className="ml-1 size-4 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </Link>
        }
      />

      <Features
        id="features"
        eyebrow="Everything you need"
        headline="From first roll to darkroom mastery"
        features={features}
      />

      <CTA
        headline="Ready to develop?"
        subheadline="Open the calculator and get your first development time in seconds."
        cta={
          <ButtonLink href="/develop" size="lg" color="light">
            Open Calculator
          </ButtonLink>
        }
      />

      <div className="flex justify-center py-16">
        <SpinningText radius={6} duration={12}>analog hive • analog hive • </SpinningText>
      </div>

      <Footer />
    </main>
  )
}
