import { Clock, Thermometer, FlaskConical, Calculator } from "lucide-react"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { SpinningText } from "@/components/magicui/spinning-text"
import { Eyebrow } from "@/components/landing/eyebrow"
import { ButtonLink } from "@/components/landing/button"
import { createClient } from "@/lib/supabase/server"

const features = [
  {
    icon: <Calculator size={20} />,
    title: "Development Calculator",
    description:
      "Look up precise development times for hundreds of film and developer combinations, with push/pull adjustments.",
    href: "/develop",
    cta: "Develop film ->",
  },
  {
    icon: <Clock size={20} />,
    title: "Darkroom Timer",
    description:
      "Step-by-step agitation cues and a full-screen darkroom mode keep you on track from start to finish.",
    href: "/develop/timer",
    cta: "Develop film ->",
  },
  {
    icon: <Thermometer size={20} />,
    title: "Temperature Correction",
    description:
      "Automatically adjust development times when your tank isn't at box temperature.",
    href: "/tools/temperature-correction",
    cta: "Adjust temperature ->",
  },
  {
    icon: <FlaskConical size={20} />,
    title: "Volume Mixer",
    description:
      "Calculate exact developer and water volumes for any dilution ratio and tank size.",
    href: "/tools/volume-mixer",
    cta: "Calculate ->",
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
        headline={user ? "Welcome back." : "Calculate. Develop. Perfect."}
        subheadline={
          user
            ? "Open your dashboard for saved items, or continue with the calculators and tools."
            : "Precise development times, temperature correction, and volume mixing for analog film — all in one place."
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
            <ButtonLink href="/develop" size="lg" color="dark/light">
              Start Developing
            </ButtonLink>
          )
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
        <SpinningText radius={6} duration={12}>
          {"analog hive • analog hive • "}
        </SpinningText>
      </div>

      <Footer />
    </main>
  )
}
