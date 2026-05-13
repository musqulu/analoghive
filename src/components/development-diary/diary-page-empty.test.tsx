import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { DiaryPageEmpty } from "@/components/development-diary/diary-page-empty"

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

describe("DiaryPageEmpty", () => {
  it("renders headline, guidance copy, and development timer link", () => {
    render(<DiaryPageEmpty />)

    expect(screen.getByRole("heading", { name: /no diary entries yet/i })).toBeInTheDocument()
    expect(screen.getByText(/development timer while signed in/i)).toBeInTheDocument()
    expect(screen.getByText(/wash step/i)).toBeInTheDocument()

    const cta = screen.getByRole("link", { name: /^open development timer$/i })
    expect(cta).toHaveAttribute("href", "/develop/timer")
  })
})
