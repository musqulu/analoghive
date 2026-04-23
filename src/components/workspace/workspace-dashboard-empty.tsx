import Image from "next/image"
import { ButtonLink } from "@/components/landing/button"
import { cn } from "@/lib/utils"

export function WorkspaceDashboardEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-5 shadow-ds-card-lg sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex justify-center">
        <Image
          src="/dashboard-empty-state.png"
          alt="Line drawing of a bee on a film developing tank"
          width={200}
          height={200}
          className="h-auto w-full max-w-[200px] sm:max-w-[220px]"
          priority
        />
      </div>

      <h2 className="mb-2 text-center text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
        Ready to start developing?
      </h2>
      <p className="mx-auto mb-5 max-w-lg text-center text-sm/6 text-muted-foreground sm:text-base/7">
        Open the film calculator to choose your stock, developer, and times. When you want a
        reusable workflow with steps and notes, create a recipe you can open anytime.
      </p>

      <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
        <ButtonLink href="/develop" color="dark/light" size="md">
          Develop Film
        </ButtonLink>
        <ButtonLink href="/recipes/new" color="light" size="md">
          Create a Recipe
        </ButtonLink>
      </div>
    </div>
  )
}
