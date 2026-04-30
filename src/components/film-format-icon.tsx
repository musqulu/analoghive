import { Cylinder, Film, SquareStack, type LucideIcon } from "lucide-react"
import type { FilmFormat } from "@/types/development"

const iconByFormat: Record<FilmFormat, LucideIcon> = {
  "35mm": Film,
  "120": Cylinder,
  sheet: SquareStack,
}

export function FilmFormatIcon({
  format,
  className,
}: {
  format: FilmFormat
  className?: string
}) {
  const Icon = iconByFormat[format] ?? Film
  return <Icon className={className} aria-hidden />
}
