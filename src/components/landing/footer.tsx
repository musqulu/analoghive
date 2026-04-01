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
    <footer className="border-t border-olive-200 dark:border-olive-800">
      <div className="nav-sunset-stripe" aria-hidden />
      <Container>
        <div className="flex flex-col items-center gap-6 py-12 sm:flex-row sm:justify-between">
          <Link href="/" className="text-sm font-bold tracking-tight text-olive-950 dark:text-white">
            Analog Hive
          </Link>
          <nav className="flex flex-wrap justify-center gap-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm/7 text-olive-600 hover:text-olive-950 dark:text-olive-400 dark:hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-olive-500 dark:text-olive-500">
            © {new Date().getFullYear()} Analog Hive
          </p>
        </div>
      </Container>
    </footer>
  )
}
