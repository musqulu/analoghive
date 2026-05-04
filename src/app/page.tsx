import {
  Clock,
  Thermometer,
  FlaskConical,
  Calculator,
  ScrollText,
  MessageCircle,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import { FAQ } from "@/components/landing/faq"
import { Testimonials } from "@/components/landing/testimonials"
import { Footer } from "@/components/landing/footer"
import { SpinningText } from "@/components/magicui/spinning-text"
import { Eyebrow } from "@/components/landing/eyebrow"
import { ButtonLink, PlainButtonLink, SoftButtonLink } from "@/components/landing/button"
import { createClient } from "@/lib/supabase/server"

function buildLandingFeatures(user: User | null) {
  const aiHref = user ? "/workspace" : "/signup?next=/workspace"
  const aiCta = user ? "Open companion →" : "Try companion →"

  return [
    {
      icon: <Calculator size={20} />,
      title: "Development Calculator",
      description:
        "Look up development times for film and developer combinations, including push/pull adjustments and chart-based references.",
      href: "/develop",
      cta: "Develop film →",
    },
    {
      icon: <MessageCircle size={20} />,
      title: "Darkroom companion (AI)",
      description:
        "Chat through questions as you work—plain-language explanations, next-step guidance, and memory of what you have already set up in this flow.",
      href: aiHref,
      cta: aiCta,
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
      cta: "Create account →",
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
}

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const features = buildLandingFeatures(user)

  return (
    <main>
      <Hero
        eyebrow={user ? <Eyebrow>Your dashboard</Eyebrow> : undefined}
        headline={user ? "Welcome back." : "Modern darkroom companion"}
        subheadline={
          user
            ? "Pick up favorites, recipes, and your darkroom log—or ask the companion when you want a clearer read on chemistry, timing, or what to do next."
            : "Film development tools with chart-based results, saved favorites, custom recipes, and an AI companion that teaches, guides, and remembers your session."
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
        headline="Hands-on tools, plus guidance when you want it"
        features={features}
      />

      <CTA
        headline="Start now. Save your process later."
        subheadline="Use the calculators and timer without friction. Create a free account when you want saved recipes and favorites—and a companion that keeps context with your workflow."
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

      <FAQ />

      <Testimonials />

      <div className="flex justify-center py-16">
        <SpinningText radius={6} duration={12}>
          {"analog hive • analog hive • "}
        </SpinningText>
      </div>

      <Footer />
    </main>
  )
}
