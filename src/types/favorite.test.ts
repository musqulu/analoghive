import { favoriteListTitle, formatFavoriteTitle } from "@/types/favorite"

describe("favoriteListTitle", () => {
  const base = {
    film_name: "HP5",
    developer_name: "Rodinal",
    film_iso: "400",
  }

  it("uses custom display_name when non-empty", () => {
    expect(
      favoriteListTitle({
        ...base,
        display_name: "  My roll  ",
      }),
    ).toBe("My roll")
  })

  it("falls back to formatFavoriteTitle when display_name is null or blank", () => {
    expect(favoriteListTitle({ ...base, display_name: null })).toBe(
      formatFavoriteTitle(base.film_name, base.developer_name, base.film_iso),
    )
    expect(favoriteListTitle({ ...base, display_name: "   " })).toBe(
      formatFavoriteTitle(base.film_name, base.developer_name, base.film_iso),
    )
  })
})
