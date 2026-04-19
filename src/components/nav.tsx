"use client"

import * as Dialog from "@radix-ui/react-dialog"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { ChevronDown, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AuthNav } from "@/components/auth-nav"
import { useAuthSession } from "@/components/auth-session-provider"
import { cn } from "@/lib/utils"

const toolLinks = [
  { href: "/develop", label: "Develop film" },
  { href: "/tools/temperature-correction", label: "Temperature correction" },
  { href: "/tools/volume-mixer", label: "Volume mixer" },
]

const STORIES_HREF = "/stories"
const FAVORITES_HREF = "/favorites"

function isToolsActive(pathname: string) {
  return toolLinks.some(({ href }) => pathname === href)
}

function isStoriesActive(pathname: string) {
  return pathname === STORIES_HREF || pathname.startsWith(`${STORIES_HREF}/`)
}

function navLinkClass(pathname: string, href: string) {
  const active = pathname === href
  return cn(
    "text-sm/7 font-medium transition-colors",
    active
      ? "font-semibold text-foreground"
      : "text-muted-foreground hover:text-foreground"
  )
}

function storiesNavClass(pathname: string) {
  return cn(
    "text-sm/7 font-medium transition-colors",
    isStoriesActive(pathname)
      ? "font-semibold text-foreground"
      : "text-muted-foreground hover:text-foreground"
  )
}

function favoritesNavClass(pathname: string) {
  return cn(
    "text-sm/7 font-medium transition-colors",
    pathname === FAVORITES_HREF
      ? "font-semibold text-foreground"
      : "text-muted-foreground hover:text-foreground"
  )
}

function toolsTriggerClass(pathname: string) {
  return cn(
    "inline-flex items-center gap-1 rounded-md text-sm/7 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isToolsActive(pathname)
      ? "font-semibold text-foreground"
      : "text-muted-foreground hover:text-foreground"
  )
}

function toolMenuItemClass(pathname: string, href: string) {
  const active = pathname === href
  return cn(
    "block w-full cursor-pointer rounded-sm px-2 py-2 text-sm outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
    active
      ? "font-semibold text-foreground"
      : "text-muted-foreground"
  )
}

export function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { showAuthed } = useAuthSession()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-10 bg-background nav-edge">
      <nav className="relative mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-6 lg:px-10">
        <div className="hidden flex-1 items-center gap-6 md:flex">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className={toolsTriggerClass(pathname)}>
              Tools
              <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-ds-card"
                align="start"
                sideOffset={8}
              >
                {toolLinks.map(({ href, label }) => (
                  <DropdownMenu.Item key={href} asChild>
                    <Link href={href} className={toolMenuItemClass(pathname, href)}>
                      {label}
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <Link href={STORIES_HREF} className={storiesNavClass(pathname)}>
            Stories
          </Link>

          {showAuthed ? (
            <Link href={FAVORITES_HREF} className={favoritesNavClass(pathname)}>
              Favorites
            </Link>
          ) : null}
        </div>

        <Link
          href="/"
          className="text-xl font-medium tracking-tight text-foreground md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          Analog Hive
        </Link>

        <div className="flex flex-1 items-center justify-end gap-3">
          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted md:hidden"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-panel"
              >
                <Menu className="h-5 w-5 shrink-0" aria-hidden />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[50] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content
                id="mobile-nav-panel"
                className="fixed right-0 top-0 z-[50] flex h-full w-[min(100%,20rem)] flex-col border-l border-border bg-background p-6 shadow-ds outline-none focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-4 data-[state=open]:slide-in-from-right-4"
              >
                <Dialog.Title className="sr-only">Main navigation</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Tools, stories, favorites, and account actions.
                </Dialog.Description>
                <div className="mb-4 flex shrink-0 items-center justify-between border-b border-border pb-4">
                  <span className="text-sm font-semibold text-foreground">Menu</span>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5 shrink-0" aria-hidden />
                    </button>
                  </Dialog.Close>
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                  <div>
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tools
                    </p>
                    <div className="flex flex-col gap-1">
                      {toolLinks.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className={cn(
                            navLinkClass(pathname, href),
                            "rounded-md px-3 py-3 text-base/7"
                          )}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link
                    href={STORIES_HREF}
                    className={cn(
                      storiesNavClass(pathname),
                      "rounded-md px-3 py-3 text-base/7"
                    )}
                  >
                    Stories
                  </Link>
                  {showAuthed ? (
                    <Link
                      href={FAVORITES_HREF}
                      className={cn(
                        favoritesNavClass(pathname),
                        "rounded-md px-3 py-3 text-base/7"
                      )}
                    >
                      Favorites
                    </Link>
                  ) : null}
                </div>
                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  <AuthNav className="flex-col items-stretch" />
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <div className="hidden md:flex md:items-center md:gap-3">
            <AuthNav />
          </div>
        </div>
      </nav>
    </header>
  )
}
