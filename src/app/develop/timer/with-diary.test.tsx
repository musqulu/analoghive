import React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { TimerPageWithDiary } from "./with-diary"
import { logDevelopmentRun } from "@/lib/log-development-run"
import type { DevelopmentProcessSnapshot } from "@/types/development-log"
import type { DevelopmentSessionId } from "@/components/ui/timer"

const mockProcessSnapshot: DevelopmentProcessSnapshot = {
  v: 1,
  developmentTimeMinutes: 1,
  developerDilution: "1+50",
  processTimes: { dev: 1, stop: 0, fix: 0, wash: 0 },
  washingMethod: {
    type: "running",
    runningWaterTime: 0,
    ilfordInversions: { first: 5, second: 10, third: 20 },
    custom: { totalTime: 0, waterChanges: 1 },
  },
  temperatures: { dev: 20, stop: 20, fix: 20, wash: 20 },
  temperatureUnit: "celsius",
  totalVolume: 500,
  isColor: false,
}

jest.mock("@/components/development-diary/confetti", () => ({
  burstCelebrationConfetti: jest.fn(),
}))

function mockTimer({
  onDevComplete,
  onProcessComplete,
}: {
  onDevComplete?: (
    snapshot: DevelopmentProcessSnapshot,
    sessionId: DevelopmentSessionId,
  ) => void
  onProcessComplete?: (
    snapshot: DevelopmentProcessSnapshot,
    sessionId: DevelopmentSessionId,
  ) => void
}) {
  return (
    <div>
      <button onClick={() => onDevComplete?.(mockProcessSnapshot, "timer:1")}>
        Finish dev
      </button>
      <button onClick={() => onDevComplete?.(mockProcessSnapshot, "timer:2")}>
        Finish second dev
      </button>
      <button onClick={() => onProcessComplete?.(mockProcessSnapshot, "timer:1")}>
        Finish process
      </button>
    </div>
  )
}

jest.mock("@/components/ui/timer", () => {
  return {
    Timer: mockTimer,
  }
})

jest.mock("@/lib/log-development-run", () => ({
  logDevelopmentRun: jest.fn(),
}))

const mockLogDevelopmentRun = logDevelopmentRun as jest.MockedFunction<
  typeof logDevelopmentRun
>

describe("TimerPageWithDiary", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("enables diary notes when the log insert resolves after completion opens", async () => {
    let resolveLog!: (value: { id: string } | null) => void
    mockLogDevelopmentRun.mockReturnValue(
      new Promise((resolve) => {
        resolveLog = resolve
      }),
    )

    render(
      <TimerPageWithDiary
        filmName="HP5 Plus"
        filmFormat="35mm"
        filmIso="400"
        developerName="Rodinal"
        developerDilution="1+50"
        developmentTime={1}
        temperature={20}
        totalVolume={500}
        recipeId={null}
        favoriteId={null}
        optionKeyParam={null}
        tempUnitParam="celsius"
        pushPullParam={null}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Finish dev" }))
    fireEvent.click(screen.getByRole("button", { name: "Finish process" }))

    expect(screen.getByText(/Sign in before developing/)).toBeInTheDocument()

    await act(async () => {
      resolveLog({ id: "log-1" })
      await Promise.resolve()
    })

    await waitFor(() =>
      expect(screen.getByLabelText("Diary title (optional)")).toBeInTheDocument(),
    )
    expect(screen.getByLabelText("Diary notes (optional)")).toBeInTheDocument()
  })

  it("logs each timer session once instead of capping at one per page load", async () => {
    mockLogDevelopmentRun.mockResolvedValueOnce({ id: "log-1" })
    mockLogDevelopmentRun.mockResolvedValueOnce({ id: "log-2" })

    render(
      <TimerPageWithDiary
        filmName="HP5 Plus"
        filmFormat="35mm"
        filmIso="400"
        developerName="Rodinal"
        developerDilution="1+50"
        developmentTime={1}
        temperature={20}
        totalVolume={500}
        recipeId={null}
        favoriteId={null}
        optionKeyParam={null}
        tempUnitParam="celsius"
        pushPullParam={null}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Finish dev" }))
    fireEvent.click(screen.getByRole("button", { name: "Finish dev" }))
    fireEvent.click(screen.getByRole("button", { name: "Finish second dev" }))

    await waitFor(() => expect(mockLogDevelopmentRun).toHaveBeenCalledTimes(2))
  })

  it("retries diary logging when an in-flight dev auto-log fails at process completion", async () => {
    let resolveLog!: (value: { id: string } | null) => void
    mockLogDevelopmentRun
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveLog = resolve
          }),
      )
      .mockResolvedValueOnce({ id: "log-retry" })

    render(
      <TimerPageWithDiary
        filmName="HP5 Plus"
        filmFormat="35mm"
        filmIso="400"
        developerName="Rodinal"
        developerDilution="1+50"
        developmentTime={1}
        temperature={20}
        totalVolume={500}
        recipeId={null}
        favoriteId={null}
        optionKeyParam={null}
        tempUnitParam="celsius"
        pushPullParam={null}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Finish dev" }))
    fireEvent.click(screen.getByRole("button", { name: "Finish process" }))

    await act(async () => {
      resolveLog(null)
      await Promise.resolve()
    })

    await waitFor(() => expect(mockLogDevelopmentRun).toHaveBeenCalledTimes(2))
    await waitFor(() =>
      expect(screen.getByLabelText("Diary title (optional)")).toBeInTheDocument(),
    )
  })

  it("creates a diary log when the process completes without a dev auto-log", async () => {
    mockLogDevelopmentRun.mockResolvedValueOnce({ id: "log-skipped-dev" })

    render(
      <TimerPageWithDiary
        filmName="HP5 Plus"
        filmFormat="35mm"
        filmIso="400"
        developerName="Rodinal"
        developerDilution="1+50"
        developmentTime={1}
        temperature={20}
        totalVolume={500}
        recipeId={null}
        favoriteId={null}
        optionKeyParam={null}
        tempUnitParam="celsius"
        pushPullParam={null}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Finish process" }))

    await waitFor(() => expect(mockLogDevelopmentRun).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(screen.getByLabelText("Diary title (optional)")).toBeInTheDocument(),
    )
  })
})
