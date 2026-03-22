"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Popover from "@radix-ui/react-popover"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const toolLinks = [
  { href: "/develop", label: "Film Dev" },
  { href: "/tools/volume-mixer", label: "Volume Mixer" },
  { href: "/tools/temperature-correction", label: "Temperature Correction" },
]

export function Nav() {
  const pathname = usePathname()
  const [toolsOpen, setToolsOpen] = React.useState(false)

  return (
    <header className="bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left: CTA + Tools */}
            <div className="flex items-center gap-3">
              <Link href="/develop" className="nav-glow-btn">
                Let&apos;s Develop Film
              </Link>

              <Popover.Root open={toolsOpen} onOpenChange={setToolsOpen}>
                <Popover.Trigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      toolsOpen
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    Tools
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform",
                        toolsOpen && "rotate-180"
                      )}
                    />
                  </button>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Content
                    sideOffset={8}
                    align="start"
                    className="z-50 min-w-[200px] rounded-lg border border-border bg-popover p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95"
                  >
                    {toolLinks.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setToolsOpen(false)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          pathname === href
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        {label}
                      </Link>
                    ))}
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>

            {/* Center: Brand */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight"
            >
              Analog Hive
            </Link>

            {/* Right: Auth */}
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors">
                Login
              </button>
              <button className="px-4 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="nav-sunset-stripe" aria-hidden />
    </header>
  )
}
