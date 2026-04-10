import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import { DevelopmentMode } from "./development-mode"

jest.useFakeTimers()
jest.mock("lucide-react")

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  filmName: "HP5 Plus",
  developerName: "Rodinal",
  volume: "500",
  dilution: "1+50",
  time: 600,
}

describe("DevelopmentMode", () => {
  beforeEach(() => {
    defaultProps.onClose.mockClear()
  })

  afterEach(() => jest.clearAllTimers())

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <DevelopmentMode {...defaultProps} isOpen={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("displays film and developer info", () => {
    render(<DevelopmentMode {...defaultProps} />)
    expect(screen.getByText("HP5 Plus")).toBeInTheDocument()
    expect(screen.getByText("Rodinal")).toBeInTheDocument()
    expect(screen.getByText("500ml")).toBeInTheDocument()
    expect(screen.getByText("1+50")).toBeInTheDocument()
  })

  it("displays correct time format in header (regression: was time/60)", () => {
    render(<DevelopmentMode {...defaultProps} time={600} />)
    expect(screen.getByText(/1\+50 @ 10:00/)).toBeInTheDocument()
  })

  it("shows initial countdown in MM:SS", () => {
    render(<DevelopmentMode {...defaultProps} time={600} />)
    expect(screen.getByText("10:00")).toBeInTheDocument()
  })

  it("timer counts down when started", () => {
    render(<DevelopmentMode {...defaultProps} time={120} />)
    expect(screen.getByText("02:00")).toBeInTheDocument()

    const startButton = screen.getByText("Start")
    fireEvent.click(startButton)

    act(() => jest.advanceTimersByTime(5000))
    expect(screen.getByText("01:55")).toBeInTheDocument()
  })

  it("transitions to next step when countdown reaches zero", () => {
    render(<DevelopmentMode {...defaultProps} time={3} />)
    fireEvent.click(screen.getByText("Start"))
    expect(screen.getByText("DEVELOPER STEP")).toBeInTheDocument()

    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(1000))
    expect(screen.getByText("STOP STEP")).toBeInTheDocument()
  })

  it("can skip to next step manually", () => {
    render(<DevelopmentMode {...defaultProps} time={600} />)
    expect(screen.getByText("DEVELOPER STEP")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Next Step"))
    expect(screen.getByText("STOP STEP")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Next Step"))
    expect(screen.getByText("FIXER STEP")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Next Step"))
    expect(screen.getByText("WASH STEP")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Next Step"))
    expect(screen.getByText("DEVELOPMENT COMPLETE")).toBeInTheDocument()
  })

  it("reset restores to initial state", () => {
    render(<DevelopmentMode {...defaultProps} time={60} />)
    const startButton = screen.getByText("Start")
    fireEvent.click(startButton)

    act(() => jest.advanceTimersByTime(10000))

    const resetButton = screen.getByText("Reset")
    fireEvent.click(resetButton)

    expect(screen.getByText("01:00")).toBeInTheDocument()
    expect(screen.getByText("DEVELOPER STEP")).toBeInTheDocument()
  })

  it("calls onClose when close button is clicked", () => {
    render(<DevelopmentMode {...defaultProps} />)
    const closeButton = screen.getByLabelText("Close development mode")
    fireEvent.click(closeButton)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })
})
