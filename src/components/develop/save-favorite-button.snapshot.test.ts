import {
  buildDiaryCalcSnapshotFromCalculator,
  buildFavoriteSnapshotFromCalculator,
} from "@/components/develop/save-favorite-button"

const baseProps = {
  filmName: "HP5 Plus",
  filmFormat: "35mm" as const,
  filmIso: "400",
  developerName: "Rodinal",
  optionKey: "1+25|20",
  pushPullStops: 0,
  totalVolume: 500,
  temperatureUnit: "celsius",
  constantAgitation: false,
  chartTemperature: 20,
  chartTimeMinutes: 8,
}

describe("buildDiaryCalcSnapshotFromCalculator", () => {
  it("falls back to chart temperature and time when the temp field is empty", () => {
    expect(
      buildDiaryCalcSnapshotFromCalculator({
        ...baseProps,
        modifiedTemperature: null,
        correctedTimeMinutes: null,
      }),
    ).toEqual(
      buildFavoriteSnapshotFromCalculator({
        ...baseProps,
        modifiedTemperature: 20,
        correctedTimeMinutes: 8,
      }),
    )
  })

  it("keeps corrected values when the temp field is set", () => {
    expect(
      buildDiaryCalcSnapshotFromCalculator({
        ...baseProps,
        modifiedTemperature: 24,
        correctedTimeMinutes: 6.5,
      }),
    ).toEqual(
      buildFavoriteSnapshotFromCalculator({
        ...baseProps,
        modifiedTemperature: 24,
        correctedTimeMinutes: 6.5,
      }),
    )
  })
})
