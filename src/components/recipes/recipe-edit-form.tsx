"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { parseRecipeDraftFromSearchParams } from "@/lib/recipe-draft-query"
import { Pencil } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ProcessEditor } from "@/components/timer/process-editor"
import { StepTimeMinSec } from "@/components/recipes/step-time-min-sec"
import { Button } from "@/components/landing/button"
import type { FilmFormat } from "@/types/development"
import {
  createEmptyRecipePayload,
  recipePayloadToInsert,
  recipeTitleSuggestion,
  type RecipePayloadV1,
} from "@/types/recipe"
import { pageTitle } from "@/lib/app-page-layout"

const inputClass = "ds-input"
const labelClass = "text-sm font-medium mb-2 block"

const DEFAULT_PRE_SOAK_MINUTES = 3

function syncWashFromMethod(
  wm: RecipePayloadV1["washingMethod"],
  prevWash: number,
): number {
  if (wm.type === "running") return wm.runningWaterTime
  if (wm.type === "ilford") return 3
  if (wm.type === "custom") return wm.custom.totalTime
  return prevWash
}

function processTimesForSave(payload: RecipePayloadV1): RecipePayloadV1["processTimes"] {
  const base = {
    ...payload.processTimes,
    dev: payload.developmentTimeMinutes,
  }
  if (payload.preSoak === true) return base
  const { preSoak, ...rest } = base
  void preSoak
  return rest
}

interface RecipeEditFormProps {
  mode: "new" | "edit"
  recipeId?: string
  defaultPayload: RecipePayloadV1
  /** When editing an existing row, the title from the database */
  savedTitle?: string
}

export function RecipeEditForm({
  mode,
  recipeId,
  defaultPayload,
  savedTitle,
}: RecipeEditFormProps) {
  const router = useRouter()
  const [payload, setPayload] = React.useState<RecipePayloadV1>(defaultPayload)
  const [title, setTitle] = React.useState(
    () => savedTitle?.trim() || recipeTitleSuggestion(defaultPayload),
  )
  const [washModalOpen, setWashModalOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [optionalOpen, setOptionalOpen] = React.useState(false)

  const setIdentity = (patch: Partial<RecipePayloadV1["identity"]>) => {
    setPayload((p) => ({ ...p, identity: { ...p.identity, ...patch } }))
  }

  const save = async () => {
    const t = title.trim()
    if (!t) {
      setError("Add a recipe title.")
      return
    }
    const preSoakMin = payload.processTimes.preSoak ?? 0
    if (payload.preSoak === true && (preSoakMin <= 0 || Number.isNaN(preSoakMin))) {
      setError("Set a pre soak time when pre soak is enabled.")
      return
    }
    setError(null)
    setBusy(true)
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const uid = session?.user.id
    if (!uid) {
      setBusy(false)
      setError("You’re signed out. Sign in and try again.")
      return
    }

    const toSave: RecipePayloadV1 = {
      ...payload,
      preSoak: payload.preSoak === true,
      developmentTimeMinutes: payload.developmentTimeMinutes,
      processTimes: processTimesForSave(payload),
    }

    if (mode === "new") {
      const row = recipePayloadToInsert(uid, t, toSave)
      const { data, error: insErr } = await supabase
        .from("development_recipes")
        .insert(row)
        .select("id")
        .single()
      setBusy(false)
      if (insErr) {
        setError(insErr.message)
        return
      }
      if (data?.id) router.push(`/recipes/${data.id}`)
      return
    }

    if (!recipeId) {
      setBusy(false)
      return
    }
    const { error: upErr } = await supabase
      .from("development_recipes")
      .update({
        title: t,
        payload: toSave as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recipeId)
    setBusy(false)
    if (upErr) {
      setError(upErr.message)
      return
    }
    router.push(`/recipes/${recipeId}`)
  }

  const cancel = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/workspace")
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div>
        <h1 className={pageTitle}>{mode === "new" ? "New recipe" : "Edit recipe"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Adjust time, steps &amp; add notes. Save to recipes list and start a new timer with the saved
          steps.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="recipe-title" className={labelClass}>
            Title
          </label>
          <input
            id="recipe-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            autoComplete="off"
            placeholder="e.g. HP5 in Rodinal"
          />
        </div>

        <div className="rounded-lg bg-card p-6 ds-card space-y-4">
          <h2 className="text-lg font-medium">Film &amp; developer</h2>
          <div>
            <label className={labelClass} htmlFor="rfilm">
              Film
            </label>
            <input
              id="rfilm"
              type="text"
              value={payload.identity.filmName}
              onChange={(e) => setIdentity({ filmName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rformat">
              Format
            </label>
            <select
              id="rformat"
              value={payload.identity.filmFormat}
              onChange={(e) =>
                setIdentity({ filmFormat: e.target.value as FilmFormat })
              }
              className={inputClass}
            >
              <option value="35mm">35mm</option>
              <option value="120">120</option>
              <option value="sheet">Sheet</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="riso">
              ISO / EI
            </label>
            <input
              id="riso"
              type="text"
              value={payload.identity.filmIso}
              onChange={(e) => setIdentity({ filmIso: e.target.value })}
              className={inputClass}
              placeholder="e.g. 400"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rdev">
              Developer
            </label>
            <input
              id="rdev"
              type="text"
              value={payload.identity.developerName}
              onChange={(e) => setIdentity({ developerName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rdil">
              Dilution (display)
            </label>
            <input
              id="rdil"
              type="text"
              value={payload.developerDilution}
              onChange={(e) => setPayload((p) => ({ ...p, developerDilution: e.target.value }))}
              className={inputClass}
              placeholder="e.g. 1+25"
            />
          </div>
        </div>

        <div className="rounded-lg bg-card p-6 ds-card space-y-4">
          <h2 className="text-lg font-medium">Step times</h2>
          <div className="flex flex-col gap-6">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                id="rpre"
                checked={payload.preSoak === true}
                onChange={(e) => {
                  const on = e.target.checked
                  setPayload((p) => {
                    if (!on) {
                      const { preSoak, ...restPt } = p.processTimes
                      void preSoak
                      return {
                        ...p,
                        preSoak: false,
                        processTimes: restPt,
                      }
                    }
                    const nextPre =
                      (p.processTimes.preSoak ?? 0) > 0
                        ? p.processTimes.preSoak!
                        : DEFAULT_PRE_SOAK_MINUTES
                    return {
                      ...p,
                      preSoak: true,
                      processTimes: { ...p.processTimes, preSoak: nextPre },
                    }
                  })
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
              />
              <span className="font-medium text-foreground">Pre soak</span>
            </label>
            {payload.preSoak === true ? (
              <StepTimeMinSec
                label="Pre soak time"
                idPrefix="rpretime"
                valueDecimalMinutes={payload.processTimes.preSoak ?? DEFAULT_PRE_SOAK_MINUTES}
                onChange={(v) =>
                  setPayload((p) => ({
                    ...p,
                    processTimes: { ...p.processTimes, preSoak: v },
                  }))
                }
              />
            ) : null}
            <StepTimeMinSec
              label="1. Development"
              idPrefix="rdev"
              valueDecimalMinutes={payload.developmentTimeMinutes}
              onChange={(v) =>
                setPayload((p) => ({
                  ...p,
                  developmentTimeMinutes: v,
                  processTimes: { ...p.processTimes, dev: v },
                }))
              }
            />
            <StepTimeMinSec
              label="2. Stop bath"
              idPrefix="rstop"
              valueDecimalMinutes={payload.processTimes.stop}
              onChange={(v) =>
                setPayload((p) => ({
                  ...p,
                  processTimes: { ...p.processTimes, stop: v },
                }))
              }
            />
            <StepTimeMinSec
              label="3. Fixer"
              idPrefix="rfix"
              valueDecimalMinutes={payload.processTimes.fix}
              onChange={(v) =>
                setPayload((p) => ({
                  ...p,
                  processTimes: { ...p.processTimes, fix: v },
                }))
              }
            />
            <StepTimeMinSec
              label="4. Wash"
              idPrefix="rwash"
              valueDecimalMinutes={payload.processTimes.wash}
              onChange={(v) =>
                setPayload((p) => ({
                  ...p,
                  processTimes: { ...p.processTimes, wash: v },
                }))
              }
            />
          </div>
          <button
            type="button"
            onClick={() => setWashModalOpen(true)}
            className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil size={14} aria-hidden /> Wash method &amp; rinse details
          </button>
        </div>

        <div className="rounded-lg bg-card p-6 ds-card space-y-4">
          <h2 className="text-lg font-medium">Conditions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="rmt">
                Temperature
              </label>
              <input
                id="rmt"
                type="number"
                step="0.1"
                value={payload.modifiedTemperature}
                onChange={(e) =>
                  setPayload((p) => ({
                    ...p,
                    modifiedTemperature: Number.parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="rtu">
                Temperature unit
              </label>
              <select
                id="rtu"
                value={payload.temperatureUnit}
                onChange={(e) =>
                  setPayload((p) => ({
                    ...p,
                    temperatureUnit: e.target.value as "celsius" | "fahrenheit",
                  }))
                }
                className={inputClass}
              >
                <option value="celsius">°C</option>
                <option value="fahrenheit">°F</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="rvol">
              Volume (ml)
            </label>
            <input
              id="rvol"
              type="number"
              min="1"
              step="1"
              value={payload.totalVolume}
              onChange={(e) =>
                setPayload((p) => ({
                  ...p,
                  totalVolume: Number.parseInt(e.target.value, 10) || 0,
                }))
              }
              className={inputClass}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={payload.constantAgitation}
              onChange={(e) =>
                setPayload((p) => ({ ...p, constantAgitation: e.target.checked }))
              }
              className="h-4 w-4 rounded border-border"
            />
            Constant agitation
          </label>
        </div>

        <div className="rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setOptionalOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
          >
            Optional details
            <span className="text-muted-foreground">{optionalOpen ? "−" : "+"}</span>
          </button>
          {optionalOpen ? (
            <div className="space-y-4 border-t border-border px-4 py-4">
              <div>
                <label className={labelClass} htmlFor="rnotes">
                  Notes
                </label>
                <textarea
                  id="rnotes"
                  value={payload.notes ?? ""}
                  onChange={(e) => setPayload((p) => ({ ...p, notes: e.target.value }))}
                  className={`${inputClass} min-h-[88px]`}
                  placeholder="Anything you want to remember in the darkroom"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="rdiln">
                  Dilution / correction notes
                </label>
                <input
                  id="rdiln"
                  type="text"
                  value={payload.dilutionNote ?? ""}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, dilutionNote: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="ragn">
                  Agitation notes
                </label>
                <input
                  id="ragn"
                  type="text"
                  value={payload.agitationNotes ?? ""}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, agitationNotes: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="rppl">
                  Push / pull line (display)
                </label>
                <input
                  id="rppl"
                  type="text"
                  value={payload.pushPullLine ?? ""}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, pushPullLine: e.target.value || null }))
                  }
                  className={inputClass}
                  placeholder="e.g. Pushed +1 (EI 800)"
                />
              </div>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" color="light" size="md" onClick={cancel}>
            Cancel
          </Button>
          <Button
            type="button"
            color="dark/light"
            size="md"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy ? "Saving…" : "Save recipe"}
          </Button>
        </div>
      </div>

      {washModalOpen ? (
        <ProcessEditor
          customTimes={payload.processTimes}
          onCustomTimesChange={(pt) =>
            setPayload((p) => ({
              ...p,
              processTimes: pt,
              developmentTimeMinutes: pt.dev,
            }))
          }
          washingMethod={payload.washingMethod}
          onWashingMethodChange={(wm) =>
            setPayload((p) => {
              const wash = syncWashFromMethod(wm, p.processTimes.wash)
              return {
                ...p,
                washingMethod: wm,
                processTimes: { ...p.processTimes, wash },
              }
            })
          }
          onClose={() => setWashModalOpen(false)}
          onSave={() => setWashModalOpen(false)}
        />
      ) : null}
    </div>
  )
}

export function RecipeNewClient() {
  const sp = useSearchParams()
  const searchKey = sp.toString()
  const defaultPayload = React.useMemo(() => {
    return (
      parseRecipeDraftFromSearchParams(new URLSearchParams(searchKey)) ??
      createEmptyRecipePayload(false)
    )
  }, [searchKey])

  return <RecipeEditForm mode="new" defaultPayload={defaultPayload} />
}
