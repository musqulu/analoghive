import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { VolumeMixer } from "./volume-mixer"

describe("VolumeMixer", () => {
  const defaultProps = {
    dilution: "1+50",
    totalVolume: 500,
    onVolumeChange: jest.fn(),
  }

  beforeEach(() => {
    defaultProps.onVolumeChange.mockClear()
  })

  it("parses a plus-format dilution and auto-calculates", () => {
    render(<VolumeMixer {...defaultProps} dilution="1+50" />)
    expect(screen.getByText("9.8 ml")).toBeInTheDocument()
    expect(screen.getByText("490.2 ml")).toBeInTheDocument()
  })

  it("parses a colon-format dilution", () => {
    render(<VolumeMixer {...defaultProps} dilution="1:50" />)
    expect(screen.getByText("9.8 ml")).toBeInTheDocument()
    expect(screen.getByText("490.2 ml")).toBeInTheDocument()
  })

  it("parses stock dilution (all developer, no water)", () => {
    render(<VolumeMixer {...defaultProps} dilution="stock" />)
    const developerSection = screen.getByText("Developer").closest("div")!
    expect(developerSection).toHaveTextContent("500 ml")
    expect(screen.getByText("0 ml")).toBeInTheDocument()
  })

  it("calculates 1+1 dilution correctly (50/50)", () => {
    render(<VolumeMixer {...defaultProps} dilution="1+1" totalVolume={1000} />)
    const results = screen.getAllByText("500 ml")
    expect(results).toHaveLength(2)
  })

  it("shows original dilution in normalized format", () => {
    render(<VolumeMixer {...defaultProps} dilution="1:50" />)
    expect(screen.getByText(/Original dilution: 1\+50/)).toBeInTheDocument()
  })

  it("updates calculation when volume input changes", () => {
    render(<VolumeMixer {...defaultProps} dilution="1+1" totalVolume={500} />)

    const volumeInput = screen.getByDisplayValue("500")
    fireEvent.change(volumeInput, { target: { value: "1000" } })
    expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(1000)
  })

  it("clears result on empty ratio input (NaN guard)", () => {
    render(<VolumeMixer {...defaultProps} dilution="1+50" />)
    expect(screen.getByText("9.8 ml")).toBeInTheDocument()

    const inputs = screen.getAllByRole("spinbutton")
    fireEvent.change(inputs[0], { target: { value: "" } })
    expect(screen.queryByText("9.8 ml")).not.toBeInTheDocument()
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
  })
})
