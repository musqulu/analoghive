import { act, renderHook, waitFor } from "@testing-library/react"
import { useDevelopmentSelection } from "@/hooks/use-development-selection"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"

const hc110LegacyHydration: DevelopmentFavoriteSnapshot = {
  filmName: "Adox CHM",
  filmFormat: "35mm",
  filmIso: "100",
  developerName: "HC-110",
  optionKey: "B|20",
  pushPullStops: 0,
  totalVolume: 500,
  temperatureUnit: "celsius",
  modifiedTemperature: 20,
  constantAgitation: false,
}

describe("useDevelopmentSelection", () => {
  it("finishes restore after mapping a legacy HC-110 option key", async () => {
    const { result } = renderHook(() =>
      useDevelopmentSelection(hc110LegacyHydration),
    )

    await waitFor(() => {
      expect(result.current.selectedOptionKey).toBe("B 1+31|20")
    })

    act(() => {
      result.current.setSelectedDeveloper("Rodinal")
    })

    await waitFor(() => {
      expect(result.current.selectedDeveloper).toBe("Rodinal")
      expect(result.current.selectedOptionKey).not.toBe("B 1+31|20")
      expect(result.current.selectedIso).toBe("80")
    })
  })
})
