import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { RecipesPageEmpty } from "@/components/recipes/recipes-page-empty"

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    className,
    width,
    height,
  }: {
    src: string
    alt: string
    className?: string
    width?: number
    height?: number
    priority?: boolean
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} width={width} height={height} />
  ),
}))

describe("RecipesPageEmpty", () => {
  it("renders headline, guidance copy, and new recipe link", () => {
    render(<RecipesPageEmpty />)

    expect(screen.getByRole("heading", { name: /no recipes yet/i })).toBeInTheDocument()
    expect(screen.getByText(/film calculator/i)).toBeInTheDocument()
    expect(screen.getByText(/wash steps/i)).toBeInTheDocument()

    const cta = screen.getByRole("link", { name: /^new recipe$/i })
    expect(cta).toHaveAttribute("href", "/recipes/new")
  })
})
