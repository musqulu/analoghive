import { renderHook, act } from "@testing-library/react"
import { useCorrectedTime } from "./use-corrected-time"
import type { DevelopmentOption } from "@/types/development"

const mockCalculateCorrectedTime = jest.fn()
jest.mock("@/data/processed-development-times", () => ({
  calculateCorrectedTime: (...args: unknown[]) =>
    mockCalculateCorrectedTime(...args),
}))

const baseInfo: DevelopmentOption = {
  optionKey: "1+50|20",
  dilution: "1+50",
  time: 10,
  temperature: 20,
}

describe("useCorrectedTime", () => {
  beforeEach(() => {
    mockCalculateCorrectedTime.mockReset()
    mockCalculateCorrectedTime.mockReturnValue(9.5)
  })

  it("returns null correctedTime when selectedInfo is null", () => {
    const { result } = renderHook(() => useCorrectedTime(null))
    expect(result.current.correctedTime).toBeNull()
    expect(mockCalculateCorrectedTime).not.toHaveBeenCalled()
  })

  it("calculates corrected time when selectedInfo is provided", () => {
    const { result } = renderHook(() => useCorrectedTime(baseInfo))
    expect(mockCalculateCorrectedTime).toHaveBeenCalledWith(20, 10, 20, false)
    expect(result.current.correctedTime).toBe(9.5)
  })

  it("clears correctedTime when selectedInfo becomes null", () => {
    let info: DevelopmentOption | null = baseInfo
    const { result, rerender } = renderHook(() => useCorrectedTime(info))
    expect(result.current.correctedTime).toBe(9.5)

    info = null
    rerender()
    expect(result.current.correctedTime).toBeNull()
  })

  it("recalculates when modifiedTemperature changes", () => {
    mockCalculateCorrectedTime.mockReturnValue(12)
    const { result } = renderHook(() => useCorrectedTime(baseInfo))
    expect(result.current.correctedTime).toBe(12)

    mockCalculateCorrectedTime.mockReturnValue(8)
    act(() => result.current.setModifiedTemperature(24))
    expect(mockCalculateCorrectedTime).toHaveBeenCalledWith(20, 10, 24, false)
    expect(result.current.correctedTime).toBe(8)
  })

  it("clears corrected time when modifiedTemperature is cleared", () => {
    const { result } = renderHook(() => useCorrectedTime(baseInfo))
    expect(result.current.correctedTime).not.toBeNull()
    mockCalculateCorrectedTime.mockClear()

    act(() => result.current.setModifiedTemperature(null))
    expect(mockCalculateCorrectedTime).not.toHaveBeenCalled()
    expect(result.current.correctedTime).toBeNull()
    expect(result.current.modifiedTemperature).toBeNull()
  })

  it("recalculates when constantAgitation changes", () => {
    const { result } = renderHook(() => useCorrectedTime(baseInfo))
    mockCalculateCorrectedTime.mockReturnValue(7)
    act(() => result.current.setConstantAgitation(true))
    expect(mockCalculateCorrectedTime).toHaveBeenCalledWith(20, 10, 20, true)
    expect(result.current.correctedTime).toBe(7)
  })

  it("converts temperature correctly when unit toggles C -> F -> C", () => {
    const { result } = renderHook(() => useCorrectedTime(baseInfo))
    expect(result.current.temperatureUnit).toBe("celsius")
    expect(result.current.modifiedTemperature).toBe(20)

    act(() => result.current.handleTemperatureUnitChange("fahrenheit"))
    expect(result.current.temperatureUnit).toBe("fahrenheit")
    expect(result.current.modifiedTemperature).toBe(68)

    act(() => result.current.handleTemperatureUnitChange("celsius"))
    expect(result.current.temperatureUnit).toBe("celsius")
    expect(result.current.modifiedTemperature).toBe(20)
  })
})
