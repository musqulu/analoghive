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

  it("does not reset a running countdown when duration props change", () => {
    const { rerender } = render(<DevelopmentMode {...defaultProps} time={120} />)
    fireEvent.click(screen.getByText("Start"))

    act(() => jest.advanceTimersByTime(5000))
    expect(screen.getByText("01:55")).toBeInTheDocument()

    rerender(<DevelopmentMode {...defaultProps} time={240} />)

    expect(screen.getByText("DEVELOPER STEP")).toBeInTheDocument()
    expect(screen.getByText("01:55")).toBeInTheDocument()
  })

  it("transitions to next step when countdown reaches zero", () => {
    render(<DevelopmentMode {...defaultProps} time={3} />)
    fireEvent.click(screen.getByText("Start"))
    expect(screen.getByText("DEVELOPER STEP")).toBeInTheDocument()

    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(1000))
    expect(screen.getByText("STOP STEP")).toBeInTheDocument()
  })

  it("rounds fractional seconds so corrected times still advance", () => {
    render(<DevelopmentMode {...defaultProps} time={3.4} />)
    expect(screen.getByText("00:03")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Start"))
    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(1000))

    expect(screen.getByText("STOP STEP")).toBeInTheDocument()
  })

  it("does not call onDevComplete when manually skipping the developer step", () => {
    const onDevComplete = jest.fn()
    render(<DevelopmentMode {...defaultProps} onDevComplete={onDevComplete} />)

    fireEvent.click(screen.getByText("Next Step"))

    expect(onDevComplete).not.toHaveBeenCalled()
    expect(screen.getByText("STOP STEP")).toBeInTheDocument()
  })

  it("starts on pre-soak when preSoakSeconds is set", () => {
    render(<DevelopmentMode {...defaultProps} time={600} preSoakSeconds={90} />)
    expect(screen.getByText("PRESOAK STEP")).toBeInTheDocument()
    expect(screen.getByText("01:30")).toBeInTheDocument()
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

  it("shows agitation cue during first 10s of developer step", () => {
    render(<DevelopmentMode {...defaultProps} time={125} />)
    fireEvent.click(screen.getByText("Start"))
    expect(screen.getByText("Agitate")).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(5000))
    expect(screen.getByText("Agitate")).toBeInTheDocument()
  })

  it("shows agitation again at second minute of developer (elapsed-based)", () => {
    render(<DevelopmentMode {...defaultProps} time={125} />)
    fireEvent.click(screen.getByText("Start"))
    act(() => jest.advanceTimersByTime(65000))
    expect(screen.getByText("Agitate")).toBeInTheDocument()
  })

  it("uses stopSeconds for stop bath duration", () => {
    render(
      <DevelopmentMode {...defaultProps} time={60} stopSeconds={45} />,
    )
    fireEvent.click(screen.getByText("Next Step"))
    expect(screen.getByText("00:45")).toBeInTheDocument()
  })

  it("calls onDevComplete once when the developer countdown finishes", () => {
    const onDevComplete = jest.fn()
    render(
      <DevelopmentMode
        {...defaultProps}
        time={3}
        onDevComplete={onDevComplete}
      />,
    )

    fireEvent.click(screen.getByText("Start"))
    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(1000))

    expect(onDevComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByText("STOP STEP")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Start"))
    for (let i = 0; i < 31; i++) act(() => jest.advanceTimersByTime(1000))
    expect(onDevComplete).toHaveBeenCalledTimes(1)
  })

  it("calls onDevComplete after pre-soak auto-advances through developer", () => {
    const onDevComplete = jest.fn()
    render(
      <DevelopmentMode
        {...defaultProps}
        time={3}
        preSoakSeconds={2}
        onDevComplete={onDevComplete}
      />,
    )

    fireEvent.click(screen.getByText("Start"))
    for (let i = 0; i < 3; i++) act(() => jest.advanceTimersByTime(1000))
    expect(screen.getByText("DEVELOPER STEP")).toBeInTheDocument()
    expect(onDevComplete).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText("Start"))
    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(1000))

    expect(onDevComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByText("STOP STEP")).toBeInTheDocument()
  })

  it("calls onProcessComplete once when wash completes by countdown only", () => {
    const onProcessComplete = jest.fn()
    render(
      <DevelopmentMode
        {...defaultProps}
        time={3}
        stopSeconds={3}
        fixSeconds={3}
        washSeconds={3}
        onProcessComplete={onProcessComplete}
      />,
    )

    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))
    expect(screen.getByText("WASH STEP")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Start"))
    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(1000))

    expect(onProcessComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByText("DEVELOPMENT COMPLETE")).toBeInTheDocument()
  })

  it("does not call onProcessComplete when skipping wash via Next Step", () => {
    const onProcessComplete = jest.fn()
    render(
      <DevelopmentMode
        {...defaultProps}
        time={3}
        stopSeconds={3}
        fixSeconds={3}
        washSeconds={600}
        onProcessComplete={onProcessComplete}
      />,
    )

    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))

    expect(onProcessComplete).not.toHaveBeenCalled()
    expect(screen.getByText("DEVELOPMENT COMPLETE")).toBeInTheDocument()
  })

  it("reuses the dev session id when wash completes after reset without rerunning developer", () => {
    const onDevComplete = jest.fn()
    const onProcessComplete = jest.fn()
    render(
      <DevelopmentMode
        {...defaultProps}
        time={3}
        stopSeconds={3}
        fixSeconds={3}
        washSeconds={3}
        onDevComplete={onDevComplete}
        onProcessComplete={onProcessComplete}
      />,
    )

    fireEvent.click(screen.getByText("Start"))
    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(1000))
    expect(onDevComplete).toHaveBeenCalledTimes(1)
    expect(onDevComplete).toHaveBeenLastCalledWith(1)

    fireEvent.click(screen.getByText("Reset"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Start"))
    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(1000))

    expect(onProcessComplete).toHaveBeenCalledTimes(1)
    expect(onProcessComplete).toHaveBeenLastCalledWith(1)
    expect(onDevComplete).toHaveBeenCalledTimes(1)
  })

  it("starts a new session when wash is rerun after completion and reset", () => {
    const onProcessComplete = jest.fn()
    render(
      <DevelopmentMode
        {...defaultProps}
        time={3}
        stopSeconds={3}
        fixSeconds={3}
        washSeconds={3}
        onProcessComplete={onProcessComplete}
      />,
    )

    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Start"))
    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(1000))
    expect(onProcessComplete).toHaveBeenCalledTimes(1)
    expect(onProcessComplete).toHaveBeenLastCalledWith(0)

    fireEvent.click(screen.getByText("Reset"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Next Step"))
    fireEvent.click(screen.getByText("Start"))
    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(1000))

    expect(onProcessComplete).toHaveBeenCalledTimes(2)
    expect(onProcessComplete).toHaveBeenLastCalledWith(1)
  })
})
