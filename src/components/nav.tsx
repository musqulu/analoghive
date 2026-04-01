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
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="nav-sunset-stripe" aria-hidden />
      <nav className="mx-auto flex h-[4.5rem] max-w-7xl items-center px-6 lg:px-10">

        {/* Left: nav links */}
        <div className="flex flex-1 items-center gap-6 max-md:hidden">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm/7 font-medium transition-colors",
                pathname === href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Center: Brand */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-display text-xl tracking-tight text-foreground"
        >
          Analog Hive
        </Link>

        {/* Right: Auth buttons */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <button className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm/7 font-medium text-foreground hover:bg-muted transition-colors">
            Login
          </button>
          <button className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm/7 font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors">
            Sign Up
          </button>
        </div>

      </nav>
    </header>
  )
}
