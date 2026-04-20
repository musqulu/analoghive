import { Clock, Thermometer, FlaskConical, Calculator, ScrollText } from "lucide-react"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { SpinningText } from "@/components/magicui/spinning-text"
import { Eyebrow } from "@/components/landing/eyebrow"
import { ButtonLink, PlainButtonLink, SoftButtonLink } from "@/components/landing/button"
import { createClient } from "@/lib/supabase/server"

const features = [
  {
    icon: <Calculator size={20} />,
    title: "Development Calculator",
    description:
      "Look up development times for film and developer combinations, including push/pull adjustments and chart-based references.",
    href: "/develop",
    cta: "Develop film →",
  },
  {
    icon: <Clock size={20} />,
    title: "Darkroom Timer",
    description:
      "Run your process step by step with large controls, agitation cues, and a distraction-free darkroom mode.",
    href: "/develop/timer",
    cta: "Start timer →",
  },
  {
    icon: <ScrollText size={20} />,
    title: "Recipes",
    description:
      "Save your personal development setups, notes, and process steps so you can return to them anytime.",
    href: "/recipes",
    cta: "Open recipes →",
  },
  {
    icon: <Thermometer size={20} />,
    title: "Temperature Correction",
    description:
      "Adjust development times when your chemistry or tank temperature differs from the recommended value.",
    href: "/tools/temperature-correction",
    cta: "Adjust temperature →",
  },
  {
    icon: <FlaskConical size={20} />,
    title: "Volume Mixer",
    description:
      "Calculate the exact amount of developer and water for your dilution and tank volume.",
    href: "/tools/volume-mixer",
    cta: "Calculate volume →",
  },
]

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main>
      <Hero
        eyebrow={
          user ? <Eyebrow>Your dashboard</Eyebrow> : <Eyebrow>Analog Film Development</Eyebrow>
        }
        headline={user ? "Welcome back." : "Find your time. Build your process."}
        subheadline={
          user
            ? "Open your dashboard for favorites, custom recipes, and notes — or jump back into the calculators and tools."
            : "Film development tools for analog photographers with chart-based results, saved favorites, and custom recipes for your personal workflow."
        }
        cta={
          user ? (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/workspace" size="lg" color="dark/light">
                Open dashboard
              </ButtonLink>
              <ButtonLink href="/develop" size="lg" color="light">
                Start developing
              </ButtonLink>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/develop" size="lg" color="dark/light">
                Start developing
              </ButtonLink>
              <SoftButtonLink href="/signup?next=/workspace" size="lg">
                Create free account
              </SoftButtonLink>
            </div>
          )
        }
      />

      <Features
        id="features"
        headline="Everything you need to develop film"
        features={features}
      />

      <CTA
        headline="Start now. Save your process later."
        subheadline="Open the calculator whenever you need it. Add an account when you want Favorites, custom recipes, and a workflow you can reopen anytime."
        cta={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/develop" size="lg" color="light">
              Open calculator
            </ButtonLink>
            <PlainButtonLink href="/signup?next=/workspace" size="lg" color="light">
              Create account
            </PlainButtonLink>
          </div>
        }
      />

      <div className="flex justify-center py-16">
        <SpinningText radius={6} duration={12}>
          {"analog hive • analog hive • "}
        </SpinningText>
      </div>

      <Footer />
    </main>
  )
}
