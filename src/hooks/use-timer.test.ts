import { renderHook, act } from "@testing-library/react"
import { useTimer } from "./use-timer"
import type { ProcessTimes } from "@/types/development"

jest.useFakeTimers()

const defaultCustomTimes: ProcessTimes = { dev: 10, stop: 1, fix: 5, wash: 5 }

function createTimer(overrides?: Partial<Parameters<typeof useTimer>[0]>) {
  return renderHook(() =>
    useTimer({
      developmentTime: 10,
      temperature: 20,
      customTimes: defaultCustomTimes,
      ...overrides,
    })
  )
}

describe("useTimer", () => {
  afterEach(() => jest.clearAllTimers())

  it("initializes with correct seconds from developmentTime", () => {
    const { result } = createTimer({ developmentTime: 8 })
    expect(result.current.timeLeft).toBe(8 * 60)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.currentStep).toBeNull()
  })

  it("startTimer sets step, time, and isRunning", () => {
    const { result } = createTimer()
    act(() => result.current.startTimer("dev"))
    expect(result.current.currentStep).toBe("dev")
    expect(result.current.timeLeft).toBe(600)
    expect(result.current.isRunning).toBe(true)
  })

  it("counts down when running", () => {
    const { result } = createTimer({ developmentTime: 1 })
    act(() => result.current.startTimer("dev"))
    act(() => jest.advanceTimersByTime(5000))
    expect(result.current.timeLeft).toBe(55)
  })

  it("does not reset an active countdown when developmentTime changes", () => {
    const { result, rerender } = renderHook(
      ({ developmentTime }) =>
        useTimer({
          developmentTime,
          temperature: 20,
          customTimes: defaultCustomTimes,
        }),
      { initialProps: { developmentTime: 10 } },
    )

    act(() => result.current.startTimer("stop"))
    act(() => jest.advanceTimersByTime(5000))
    expect(result.current.timeLeft).toBe(55)

    rerender({ developmentTime: 12 })
    expect(result.current.currentStep).toBe("stop")
    expect(result.current.timeLeft).toBe(55)
  })

  it("toggleTimer pauses and resumes", () => {
    const { result } = createTimer()
    act(() => result.current.startTimer("dev"))
    act(() => jest.advanceTimersByTime(3000))
    const before = result.current.timeLeft

    act(() => result.current.toggleTimer())
    expect(result.current.isPaused).toBe(true)

    act(() => jest.advanceTimersByTime(5000))
    expect(result.current.timeLeft).toBe(before)

    act(() => result.current.toggleTimer())
    expect(result.current.isPaused).toBe(false)
    act(() => jest.advanceTimersByTime(2000))
    expect(result.current.timeLeft).toBe(before - 2)
  })

  it("resetTimer restores step time", () => {
    const { result } = createTimer()
    act(() => result.current.startTimer("dev"))
    act(() => jest.advanceTimersByTime(10000))
    act(() => result.current.resetTimer())

    expect(result.current.timeLeft).toBe(600)
    expect(result.current.isRunning).toBe(false)
  })

  it("auto-advances through all steps dev -> stop -> fix -> wash -> stopped", () => {
    const times: ProcessTimes = { dev: 0, stop: 0.05, fix: 0.05, wash: 0.05 }
    const { result } = createTimer({
      developmentTime: 0.05,
      customTimes: times,
    })

    act(() => result.current.startTimer("dev"))
    expect(result.current.currentStep).toBe("dev")

    act(() => jest.advanceTimersByTime(4000))
    expect(result.current.currentStep).toBe("stop")
    expect(result.current.isRunning).toBe(true)

    act(() => jest.advanceTimersByTime(4000))
    expect(result.current.currentStep).toBe("fix")

    act(() => jest.advanceTimersByTime(4000))
    expect(result.current.currentStep).toBe("wash")

    act(() => jest.advanceTimersByTime(4000))
    expect(result.current.isRunning).toBe(false)
  })

  it("uses custom process times for stop/fix/wash", () => {
    const times: ProcessTimes = { dev: 0, stop: 2, fix: 3, wash: 4 }
    const { result } = createTimer({ customTimes: times })
    act(() => result.current.startTimer("stop"))
    expect(result.current.timeLeft).toBe(120)
    act(() => result.current.startTimer("fix"))
    expect(result.current.timeLeft).toBe(180)
    act(() => result.current.startTimer("wash"))
    expect(result.current.timeLeft).toBe(240)
  })

  it("shakes during first 10 seconds of each minute (dev)", () => {
    const { result } = createTimer({ developmentTime: 10 })
    act(() => result.current.startTimer("dev"))

    act(() => jest.advanceTimersByTime(1000))
    expect(result.current.shouldShake).toBe(true)

    act(() => jest.advanceTimersByTime(9000))
    expect(result.current.shouldShake).toBe(false)

    act(() => jest.advanceTimersByTime(50000))
    expect(result.current.shouldShake).toBe(true)
  })

  it("shakes for entire short stop bath (<= 10 s)", () => {
    const tenSeconds = 10 / 60
    const times: ProcessTimes = {
      ...defaultCustomTimes,
      stop: tenSeconds,
    }
    const { result } = createTimer({ customTimes: times })
    act(() => result.current.startTimer("stop"))
    act(() => jest.advanceTimersByTime(3000))
    expect(result.current.shouldShake).toBe(true)
  })

  it("stop bath 30 s only agitates first 10 s", () => {
    const times: ProcessTimes = { ...defaultCustomTimes, stop: 0.5 }
    const { result } = createTimer({ customTimes: times })
    act(() => result.current.startTimer("stop"))
    act(() => jest.advanceTimersByTime(5000))
    expect(result.current.shouldShake).toBe(true)
    act(() => jest.advanceTimersByTime(10000))
    expect(result.current.shouldShake).toBe(false)
  })

  it("stop bath 2 min uses intermittent pattern", () => {
    const times: ProcessTimes = { ...defaultCustomTimes, stop: 2 }
    const { result } = createTimer({ customTimes: times })
    act(() => result.current.startTimer("stop"))
    act(() => jest.advanceTimersByTime(61000))
    expect(result.current.shouldShake).toBe(true)
  })

  it("fixer uses intermittent agitation", () => {
    const times: ProcessTimes = { ...defaultCustomTimes, fix: 5 }
    const { result } = createTimer({ customTimes: times })
    act(() => result.current.startTimer("fix"))
    act(() => jest.advanceTimersByTime(61000))
    expect(result.current.shouldShake).toBe(true)
  })

  it("does not shake during wash", () => {
    const { result } = createTimer()
    act(() => result.current.startTimer("wash"))
    act(() => jest.advanceTimersByTime(2000))
    expect(result.current.shouldShake).toBe(false)
  })

  it("initializes idle countdown from pre-soak when preSoak minutes > 0", () => {
    const { result } = createTimer({
      developmentTime: 10,
      customTimes: { ...defaultCustomTimes, preSoak: 2 },
    })
    expect(result.current.timeLeft).toBe(120)
  })

  it("startTimer preSoak uses pre-soak duration in seconds", () => {
    const { result } = createTimer({
      customTimes: { ...defaultCustomTimes, preSoak: 0.5 },
    })
    act(() => result.current.startTimer("preSoak"))
    expect(result.current.currentStep).toBe("preSoak")
    expect(result.current.timeLeft).toBe(30)
    expect(result.current.isRunning).toBe(true)
  })

  it("auto-advances preSoak -> dev -> stop -> fix -> wash when pre-soak enabled", () => {
    const times: ProcessTimes = {
      preSoak: 0.05,
      dev: 0,
      stop: 0.05,
      fix: 0.05,
      wash: 0.05,
    }
    const { result } = createTimer({
      developmentTime: 0.05,
      customTimes: times,
    })

    act(() => result.current.startTimer("preSoak"))
    expect(result.current.currentStep).toBe("preSoak")

    act(() => jest.advanceTimersByTime(4000))
    expect(result.current.currentStep).toBe("dev")

    act(() => jest.advanceTimersByTime(4000))
    expect(result.current.currentStep).toBe("stop")

    act(() => jest.advanceTimersByTime(4000))
    expect(result.current.currentStep).toBe("fix")

    act(() => jest.advanceTimersByTime(4000))
    expect(result.current.currentStep).toBe("wash")

    act(() => jest.advanceTimersByTime(4000))
    expect(result.current.isRunning).toBe(false)
  })

  it("does not shake during pre-soak", () => {
    const { result } = createTimer({
      customTimes: { ...defaultCustomTimes, preSoak: 1 },
    })
    act(() => result.current.startTimer("preSoak"))
    act(() => jest.advanceTimersByTime(2000))
    expect(result.current.shouldShake).toBe(false)
  })

  describe("onDevComplete", () => {
    it("fires once when dev countdown hits zero", () => {
      const onDevComplete = jest.fn()
      const times: ProcessTimes = { dev: 0.05, stop: 0.05, fix: 0.05, wash: 0.05 }
      const { result } = renderHook(() =>
        useTimer({
          developmentTime: 0.05,
          temperature: 20,
          customTimes: times,
          onDevComplete,
        }),
      )

      act(() => result.current.startTimer("dev"))
      expect(onDevComplete).not.toHaveBeenCalled()

      act(() => jest.advanceTimersByTime(4000))
      expect(onDevComplete).toHaveBeenCalledTimes(1)
      expect(result.current.currentStep).toBe("stop")

      act(() => jest.advanceTimersByTime(20000))
      expect(onDevComplete).toHaveBeenCalledTimes(1)
    })

    it("re-arms when startTimer enters dev again after a previous run", () => {
      const onDevComplete = jest.fn()
      const times: ProcessTimes = { dev: 0.05, stop: 0.05, fix: 0.05, wash: 0.05 }
      const { result } = renderHook(() =>
        useTimer({
          developmentTime: 0.05,
          temperature: 20,
          customTimes: times,
          onDevComplete,
        }),
      )

      act(() => result.current.startTimer("dev"))
      act(() => jest.advanceTimersByTime(4000))
      expect(onDevComplete).toHaveBeenCalledTimes(1)
      expect(onDevComplete).toHaveBeenLastCalledWith(1)

      act(() => result.current.startTimer("dev"))
      act(() => jest.advanceTimersByTime(4000))
      expect(onDevComplete).toHaveBeenCalledTimes(2)
      expect(onDevComplete).toHaveBeenLastCalledWith(2)
    })

    it("does not fire when stop/fix/wash steps complete on their own", () => {
      const onDevComplete = jest.fn()
      const times: ProcessTimes = { dev: 1, stop: 0.05, fix: 0.05, wash: 0.05 }
      const { result } = renderHook(() =>
        useTimer({
          developmentTime: 1,
          temperature: 20,
          customTimes: times,
          onDevComplete,
        }),
      )

      act(() => result.current.startTimer("stop"))
      act(() => jest.advanceTimersByTime(4000))
      expect(onDevComplete).not.toHaveBeenCalled()
    })

    it("fires once when auto-advancing from preSoak through dev to stop", () => {
      const onDevComplete = jest.fn()
      const times: ProcessTimes = {
        preSoak: 0.05,
        dev: 0.05,
        stop: 0.05,
        fix: 0.05,
        wash: 0.05,
      }
      const { result } = renderHook(() =>
        useTimer({
          developmentTime: 0.05,
          temperature: 20,
          customTimes: times,
          onDevComplete,
        }),
      )

      act(() => result.current.startTimer("preSoak"))
      expect(onDevComplete).not.toHaveBeenCalled()

      act(() => jest.advanceTimersByTime(4000))
      expect(result.current.currentStep).toBe("dev")
      expect(onDevComplete).not.toHaveBeenCalled()

      act(() => jest.advanceTimersByTime(4000))
      expect(result.current.currentStep).toBe("stop")
      expect(onDevComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe("onProcessComplete", () => {
    it("fires once when wash finishes naturally after a full countdown run", () => {
      const onProcessComplete = jest.fn()
      const times: ProcessTimes = { dev: 0.05, stop: 0.05, fix: 0.05, wash: 0.05 }
      const { result } = renderHook(() =>
        useTimer({
          developmentTime: 0.05,
          temperature: 20,
          customTimes: times,
          onProcessComplete,
        }),
      )

      act(() => result.current.startTimer("dev"))
      act(() => jest.advanceTimersByTime(3500))
      expect(result.current.currentStep).toBe("stop")

      act(() => jest.advanceTimersByTime(3500))
      expect(result.current.currentStep).toBe("fix")

      act(() => jest.advanceTimersByTime(3500))
      expect(result.current.currentStep).toBe("wash")

      act(() => jest.advanceTimersByTime(3500))
      expect(onProcessComplete).toHaveBeenCalledTimes(1)
      expect(result.current.isRunning).toBe(false)

      act(() => result.current.startTimer("dev"))
      act(() => jest.advanceTimersByTime(3500))
      act(() => jest.advanceTimersByTime(3500))
      act(() => jest.advanceTimersByTime(3500))
      act(() => jest.advanceTimersByTime(3500))
      expect(onProcessComplete).toHaveBeenCalledTimes(2)
    })

    it("fires when wash is run standalone to completion after startTimer(\"wash\")", () => {
      const onProcessComplete = jest.fn()
      const times: ProcessTimes = { dev: 1, stop: 0.05, fix: 0.05, wash: 0.05 }
      const { result } = renderHook(() =>
        useTimer({
          developmentTime: 1,
          temperature: 20,
          customTimes: times,
          onProcessComplete,
        }),
      )

      act(() => result.current.startTimer("wash"))
      act(() => jest.advanceTimersByTime(3500))
      expect(onProcessComplete).toHaveBeenCalledTimes(1)
    })
  })
})
