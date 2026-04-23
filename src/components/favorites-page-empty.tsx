import Image from "next/image"
import { ButtonLink } from "@/components/landing/button"
import { cn } from "@/lib/utils"

export function FavoritesPageEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-5 shadow-ds-card-lg sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex justify-center">
        <Image
          src="/favorites-empty-state.png"
          alt="Line drawing of a film strip on a clothesline with a bee"
          width={200}
          height={200}
          className="h-auto w-full max-w-[200px] sm:max-w-[220px]"
          priority
        />
      </div>

      <h2 className="mb-2 text-center text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
        No favorites yet
      </h2>
      <p className="mx-auto mb-5 max-w-lg text-center text-sm/6 text-muted-foreground sm:text-base/7">
        Save a film and developer combination from the calculator so you can jump back to the same
        chart and reference times whenever you return to that stock. For custom workflows and
        notes, use a recipe instead.
      </p>

      <div className="flex justify-center">
        <ButtonLink href="/develop" color="dark/light" size="md">
          Develop Film
        </ButtonLink>
      </div>
    </div>
  )
}
