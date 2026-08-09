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

const rodinalHydration: DevelopmentFavoriteSnapshot = {
  filmName: "HP5 Plus",
  filmFormat: "35mm",
  filmIso: "400",
  developerName: "Rodinal",
  optionKey: "1+25|20",
  pushPullStops: 0,
  totalVolume: 500,
  temperatureUnit: "celsius",
  modifiedTemperature: 20,
  constantAgitation: false,
}

describe("useDevelopmentSelection", () => {
  it("does not apply new hydration while the caller passes null (roll-active guard)", async () => {
    const { result, rerender } = renderHook(
      ({ hydration }: { hydration: DevelopmentFavoriteSnapshot | null }) =>
        useDevelopmentSelection(hydration),
      { initialProps: { hydration: hc110LegacyHydration } },
    )

    await waitFor(() => {
      expect(result.current.selectedFilm).toBe("Adox CHM")
    })

    rerender({ hydration: null })

    expect(result.current.selectedFilm).toBe("Adox CHM")

    rerender({ hydration: rodinalHydration })

    await waitFor(() => {
      expect(result.current.selectedFilm).toBe("HP5 Plus")
    })
  })

  it("does not re-apply the same hydration after a temporary null (selection unlock)", async () => {
    const { result, rerender } = renderHook(
      ({ hydration }: { hydration: DevelopmentFavoriteSnapshot | null }) =>
        useDevelopmentSelection(hydration),
      { initialProps: { hydration: hc110LegacyHydration } },
    )

    await waitFor(() => {
      expect(result.current.selectedFilm).toBe("Adox CHM")
    })

    act(() => {
      result.current.setSelectedFilm("HP5 Plus")
    })
    expect(result.current.selectedFilm).toBe("HP5 Plus")

    rerender({ hydration: null })
    rerender({ hydration: hc110LegacyHydration })

    expect(result.current.selectedFilm).toBe("HP5 Plus")
  })

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
