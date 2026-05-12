/** Shared Tailwind class strings for favorite / recipe list cards (avoid drift between surfaces). */

export const LISTING_CARD_ROOT =
  "flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-ds-card-lg sm:p-6"

export const LISTING_CARD_ICON_WRAP =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground"

export const LISTING_CARD_PILL =
  "rounded-full bg-muted px-2.5 py-1 text-xs font-medium leading-none text-muted-foreground"

export const LISTING_CARD_DIVIDER = "my-5 border-t border-border"

export const LISTING_CARD_OPEN_LINK =
  "inline-flex w-full shrink-0 items-center justify-center rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:w-auto"

/** Kebab-style icon button row (recipe / favorites / diary secondary actions). */
export const LISTING_CARD_MENU_TRIGGER =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-3 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50"
