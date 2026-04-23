import { tryHc110LegacyOptionKey } from "@/lib/hc110-dilution-legacy"

describe("tryHc110LegacyOptionKey", () => {
  it("maps single letters to new dilution|temp", () => {
    expect(tryHc110LegacyOptionKey("B|20")).toBe("B 1+31|20")
    expect(tryHc110LegacyOptionKey("G|21")).toBe("G 1+119|21")
  })

  it("returns null for non-legacy keys", () => {
    expect(tryHc110LegacyOptionKey("B 1+31|20")).toBeNull()
    expect(tryHc110LegacyOptionKey("X|20")).toBeNull()
  })
})
