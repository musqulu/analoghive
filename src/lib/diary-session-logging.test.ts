import { createDiarySessionLogTracker } from "@/lib/diary-session-logging"

describe("createDiarySessionLogTracker", () => {
  it("logs each session once", async () => {
    const tracker = createDiarySessionLogTracker()
    const logFn = jest.fn().mockResolvedValue({ id: "log-1" })

    tracker.scheduleLog("timer:1", logFn)
    await tracker.ensureLogged("timer:1", logFn)

    expect(logFn).toHaveBeenCalledTimes(1)
    expect(tracker.hasLogged("timer:1")).toBe(true)
    expect(tracker.getLogEntryId("timer:1")).toBe("log-1")
  })

  it("retries when an in-flight dev log fails before process completion", async () => {
    const tracker = createDiarySessionLogTracker()
    let resolveFirst!: (value: { id: string } | null) => void
    const firstLog = new Promise<{ id: string } | null>((resolve) => {
      resolveFirst = resolve
    })
    const logFn = jest
      .fn()
      .mockReturnValueOnce(firstLog)
      .mockResolvedValueOnce({ id: "log-retry" })

    tracker.scheduleLog("timer:1", logFn)
    const ensurePromise = tracker.ensureLogged("timer:1", logFn)

    resolveFirst(null)
    await ensurePromise

    expect(logFn).toHaveBeenCalledTimes(2)
    expect(tracker.hasLogged("timer:1")).toBe(true)
    expect(tracker.getLogEntryId("timer:1")).toBe("log-retry")
  })
})
