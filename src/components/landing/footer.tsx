import Link from "next/link"
import { Container } from "./container"

const links = [
  { href: "/develop", label: "Film Dev Calculator" },
  { href: "/tools/temperature-correction", label: "Temperature Correction" },
  { href: "/tools/volume-mixer", label: "Volume Mixer" },
  { href: "/templates", label: "Templates" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <Container>
        <div className="flex flex-col items-center gap-6 py-12 sm:flex-row sm:justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            Analog Hive
          </Link>
          <nav className="flex flex-wrap justify-center gap-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm/7 text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Analog Hive
          </p>
        </div>
      </Container>
    </footer>
  )
}
