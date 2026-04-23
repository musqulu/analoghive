import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { WorkspaceDashboardEmpty } from "@/components/workspace/workspace-dashboard-empty"

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

describe("WorkspaceDashboardEmpty", () => {
  it("renders headline, guidance copy, and CTA links", () => {
    render(<WorkspaceDashboardEmpty />)

    expect(
      screen.getByRole("heading", { name: /ready to start developing/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/film calculator/i)).toBeInTheDocument()
    expect(screen.getByText(/reusable workflow/i)).toBeInTheDocument()

    const develop = screen.getByRole("link", { name: /develop film/i })
    const recipe = screen.getByRole("link", { name: /create a recipe/i })
    expect(develop).toHaveAttribute("href", "/develop")
    expect(recipe).toHaveAttribute("href", "/recipes/new")
  })
})
