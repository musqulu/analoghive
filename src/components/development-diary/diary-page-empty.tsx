import Image from "next/image"
import { ButtonLink } from "@/components/landing/button"
import { cn } from "@/lib/utils"

export function DiaryPageEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-5 shadow-ds-card-lg sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex justify-center">
        <Image
          src="/diary-empty-state.png"
          alt="Line drawing of a notebook, pen, and bee"
          width={200}
          height={200}
          className="h-auto w-full max-w-[200px] sm:max-w-[220px]"
          priority
        />
      </div>

      <h2 className="mb-2 text-center text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
        No diary entries yet
      </h2>
      <p className="mx-auto mb-5 max-w-lg text-center text-sm/6 text-muted-foreground sm:text-base/7">
        Complete a development timer while signed in. After the wash step, you’ll be able to add a
        title and notes for each roll.
      </p>

      <div className="flex justify-center">
        <ButtonLink href="/develop/timer" color="dark/light" size="md">
          Open development timer
        </ButtonLink>
      </div>
    </div>
  )
}
