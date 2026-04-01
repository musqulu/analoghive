import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

const noisePattern = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" viewBox="0 0 100 100"><filter id="n"><feTurbulence type="turbulence" baseFrequency="1.4" numOctaves="1" seed="2" stitchTiles="stitch" result="n"/><feComponentTransfer result="g"><feFuncR type="linear" slope="4" intercept="1"/><feFuncG type="linear" slope="4" intercept="1"/><feFuncB type="linear" slope="4" intercept="1"/></feComponentTransfer><feColorMatrix type="saturate" values="0" in="g"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`
)}")`

const gradients = {
  green: {
    from: "#9ca88f",
    to: "#596352",
    darkFrom: "#333a2b",
    darkTo: "#26361b",
  },
  blue: {
    from: "#637c86",
    to: "#778599",
    darkFrom: "#243a42",
    darkTo: "#232f40",
  },
  purple: {
    from: "#7b627d",
    to: "#8f6976",
    darkFrom: "#412c42",
    darkTo: "#3c1a26",
  },
  brown: {
    from: "#8d7359",
    to: "#765959",
    darkFrom: "#382d23",
    darkTo: "#3d2323",
  },
}

export function Wallpaper({
  children,
  color,
  className,
  ...props
}: { color: "green" | "blue" | "purple" | "brown" } & ComponentProps<"div">) {
  const g = gradients[color]

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: `linear-gradient(to bottom, ${g.from}, ${g.to})`,
      }}
      {...props}
    >
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{ backgroundImage: noisePattern }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
