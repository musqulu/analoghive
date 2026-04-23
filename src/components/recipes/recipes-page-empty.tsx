import Image from "next/image"
import { ButtonLink } from "@/components/landing/button"
import { cn } from "@/lib/utils"

export function RecipesPageEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-5 shadow-ds-card-lg sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex justify-center">
        <Image
          src="/recipes-empty-state.png"
          alt="Line drawing of a bee on a film canister"
          width={200}
          height={200}
          className="h-auto w-full max-w-[200px] sm:max-w-[220px]"
          priority
        />
      </div>

      <h2 className="mb-2 text-center text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
        No recipes yet
      </h2>
      <p className="mx-auto mb-5 max-w-lg text-center text-sm/6 text-muted-foreground sm:text-base/7">
        Start from the film calculator with a combination you like, or build a recipe from scratch.
        You can edit times, wash steps, and notes whenever your process changes.
      </p>

      <div className="flex justify-center">
        <ButtonLink href="/recipes/new" color="dark/light" size="md">
          New recipe
        </ButtonLink>
      </div>
    </div>
  )
}
