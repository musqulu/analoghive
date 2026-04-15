"use client"

import type { ProcessTimes, WashingMethod } from "@/types/development"

interface ProcessEditorProps {
  customTimes: ProcessTimes
  onCustomTimesChange: (times: ProcessTimes) => void
  washingMethod: WashingMethod
  onWashingMethodChange: (method: WashingMethod) => void
  onClose: () => void
  onSave: () => void
}

export function ProcessEditor({
  customTimes,
  onCustomTimesChange,
  washingMethod,
  onWashingMethodChange,
  onClose,
  onSave,
}: ProcessEditorProps) {
  const inputClass = "ds-input"
  const smallInputClass = "ds-input-sm"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-2xl space-y-6 rounded-lg bg-card p-6 ds-card-elevated">
        <h3 className="text-lg font-medium">Edit Process Times</h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Stop Bath Time (min)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={customTimes.stop}
                onChange={(e) =>
                  onCustomTimesChange({
                    ...customTimes,
                    stop: Number(e.target.value),
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fixer Time (min)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={customTimes.fix}
                onChange={(e) =>
                  onCustomTimesChange({
                    ...customTimes,
                    fix: Number(e.target.value),
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Washing Method</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="running-water"
                    checked={washingMethod.type === "running"}
                    onChange={() =>
                      onWashingMethodChange({ ...washingMethod, type: "running" })
                    }
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="running-water" className="text-sm font-medium">
                      Running Water Rinse
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Steady stream of water at processing temperature
                    </p>
                    {washingMethod.type === "running" && (
                      <div className="mt-2">
                        <label className="text-sm font-medium mb-2 block">
                          Wash Time (min)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="20"
                          step="1"
                          value={washingMethod.runningWaterTime}
                          onChange={(e) => {
                            const t = Number(e.target.value)
                            onCustomTimesChange({ ...customTimes, wash: t })
                            onWashingMethodChange({
                              ...washingMethod,
                              runningWaterTime: t,
                            })
                          }}
                          className={smallInputClass}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="custom-method"
                    checked={washingMethod.type === "custom"}
                    onChange={() =>
                      onWashingMethodChange({ ...washingMethod, type: "custom" })
                    }
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="custom-method" className="text-sm font-medium">
                      Custom Method
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Specify total time and number of water changes
                    </p>
                    {washingMethod.type === "custom" && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="text-sm mb-1 block">
                            Total Time (min)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={washingMethod.custom.totalTime}
                            onChange={(e) =>
                              onWashingMethodChange({
                                ...washingMethod,
                                custom: {
                                  ...washingMethod.custom,
                                  totalTime: Number(e.target.value),
                                },
                              })
                            }
                            className={smallInputClass}
                          />
                        </div>
                        <div>
                          <label className="text-sm mb-1 block">
                            Water Changes
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={washingMethod.custom.waterChanges}
                            onChange={(e) =>
                              onWashingMethodChange({
                                ...washingMethod,
                                custom: {
                                  ...washingMethod.custom,
                                  waterChanges: Number(e.target.value),
                                },
                              })
                            }
                            className={smallInputClass}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="ilford-method"
                    checked={washingMethod.type === "ilford"}
                    onChange={() =>
                      onWashingMethodChange({ ...washingMethod, type: "ilford" })
                    }
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="ilford-method" className="text-sm font-medium">
                      Ilford Method (Fill-and-Dump)
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Three cycles of filling, inverting, and dumping
                    </p>
                    {washingMethod.type === "ilford" && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {(["first", "second", "third"] as const).map((cycle) => (
                          <div key={cycle}>
                            <label className="text-xs mb-1 block capitalize">
                              {cycle} Cycle
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={washingMethod.ilfordInversions[cycle]}
                              onChange={(e) =>
                                onWashingMethodChange({
                                  ...washingMethod,
                                  ilfordInversions: {
                                    ...washingMethod.ilfordInversions,
                                    [cycle]: Number(e.target.value),
                                  },
                                })
                              }
                              className={smallInputClass}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
