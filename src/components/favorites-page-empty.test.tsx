import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { FavoritesPageEmpty } from "@/components/favorites-page-empty"

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

describe("FavoritesPageEmpty", () => {
  it("renders headline, value copy, and Develop Film link", () => {
    render(<FavoritesPageEmpty />)

    expect(screen.getByRole("heading", { name: /no favorites yet/i })).toBeInTheDocument()
    expect(screen.getByText(/calculator/i)).toBeInTheDocument()
    expect(screen.getByText(/recipe instead/i)).toBeInTheDocument()

    const cta = screen.getByRole("link", { name: /develop film/i })
    expect(cta).toHaveAttribute("href", "/develop")
  })
})
