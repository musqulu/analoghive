"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/develop", label: "Film Dev" },
  { href: "/tools/temperature-correction", label: "Temperature" },
  { href: "/tools/volume-mixer", label: "Volume Mixer" },
  { href: "/templates", label: "Templates" },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 bg-background nav-edge">
      <nav className="mx-auto flex h-[4.5rem] max-w-7xl items-center px-6 lg:px-10">
        <div className="flex flex-1 items-center gap-6 max-md:hidden">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm/7 font-medium transition-colors",
                pathname === href
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-xl font-medium tracking-tight text-foreground"
        >
          Analog Hive
        </Link>

        <div className="flex flex-1 items-center justify-end gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-background px-4 py-2 text-sm/7 font-medium text-foreground shadow-ds transition-colors hover:bg-muted"
          >
            Login
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm/7 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign Up
          </button>
        </div>
      </nav>
    </header>
  )
}
