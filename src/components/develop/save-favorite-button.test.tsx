import React from "react"
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { AuthSessionProvider } from "@/components/auth-session-provider"
import { SaveFavoriteButton } from "@/components/develop/save-favorite-button"

jest.mock("lucide-react", () => ({
  Bookmark: () => null,
}))

const mockGetSession = jest.fn(() => Promise.resolve({ data: { session: null } }))

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}))

const snapshot = {
  filmName: "HP5 Plus",
  filmFormat: "35mm" as const,
  filmIso: "400",
  developerName: "Rodinal",
  optionKey: "1+25|20",
  pushPullStops: 0,
  totalVolume: 500,
  temperatureUnit: "celsius" as const,
  modifiedTemperature: 20,
  constantAgitation: false,
  correctedTimeMinutes: 7.5,
}

function renderWithAuth(ui: React.ReactElement) {
  return render(
    <AuthSessionProvider authenticatedOnServer={false}>{ui}</AuthSessionProvider>,
  )
}

describe("SaveFavoriteButton", () => {
  it("opens auth dialog when logged out and save is clicked", async () => {
    renderWithAuth(<SaveFavoriteButton snapshot={snapshot} />)

    await act(async () => {
      await Promise.resolve()
    })

    const save = screen.getByRole("button", { name: /save to favorites/i })
    await act(async () => {
      fireEvent.click(save)
    })

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /sign in to save favorites/i })).toBeInTheDocument()
    })
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login?next=/develop")
    expect(screen.getByRole("link", { name: /create account/i })).toHaveAttribute(
      "href",
      "/signup?next=/develop",
    )
  })
})
