import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { TemperatureCorrection } from "./temperature-correction"
import type { DevelopmentOption } from "@/types/development"

const selectedInfo: DevelopmentOption = {
  optionKey: "1+25|20",
  dilution: "1+25",
  time: 11,
  temperature: 20,
  timeSource: "exact",
}

describe("TemperatureCorrection", () => {
  it("disables temperature and agitation controls when locked", () => {
    render(
      <TemperatureCorrection
        selectedInfo={selectedInfo}
        temperatureUnit="celsius"
        modifiedTemperature={20}
        onModifiedTemperatureChange={jest.fn()}
        constantAgitation={false}
        onConstantAgitationChange={jest.fn()}
        correctedTime={11}
        pushPullLine=""
        disabled
      />,
    )

    expect(screen.getByLabelText(/Modified Temperature/i)).toBeDisabled()
    expect(screen.getByLabelText(/Constant Agitation/i)).toBeDisabled()
  })
})
