"use client"

import * as React from "react"
import { usePresets } from "@/hooks/use-presets"
import { useCustomTimes } from "@/hooks/use-custom-times"
import { PresetCard } from "@/components/preset-card"
import { CustomTimeForm } from "@/components/develop/custom-time-form"
import { normalizeDilutionDisplay } from "@/utils/normalize-dilution"
import { formatTime } from "@/utils/format-time"
import { Pencil, Trash2, Plus, Lock } from "lucide-react"
import type { CustomDevelopmentTime } from "@/types/development"

const isLoggedIn = false

type Tab = "presets" | "custom"

export default function TemplatesPage() {
  const { presets, remove: removePreset } = usePresets()
  const {
    customTimes,
    add: addCustom,
    remove: removeCustom,
    update: updateCustom,
  } = useCustomTimes()
  const [tab, setTab] = React.useState<Tab>("presets")
  const [showForm, setShowForm] = React.useState(false)
  const [editing, setEditing] = React.useState<CustomDevelopmentTime | null>(
    null
  )

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-sm w-full text-center space-y-4">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Log in to save and manage your development templates.
          </p>
          <button
            disabled
            className="px-6 py-2 text-sm font-medium bg-primary/50 text-primary-foreground rounded-md cursor-not-allowed"
          >
            Log in to access
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-8 pt-12">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-2xl font-bold">Templates</h1>

        <div className="flex gap-1 border-b border-border">
          {(["presets", "custom"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "presets" ? "Saved Presets" : "Custom Times"}
            </button>
          ))}
        </div>

        {tab === "presets" && (
          <div className="space-y-3">
            {presets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No saved presets yet.</p>
                <p className="text-sm mt-1">
                  Save a configuration from the Develop page to start building
                  your collection.
                </p>
              </div>
            )}
            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                onDelete={removePreset}
              />
            ))}
          </div>
        )}

        {tab === "custom" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              {!showForm && !editing && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} /> Add Custom Time
                </button>
              )}
            </div>

            {(showForm || editing) && (
              <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
                <h3 className="text-lg font-medium mb-4">
                  {editing ? "Edit Development Time" : "New Development Time"}
                </h3>
                <CustomTimeForm
                  initial={editing ?? undefined}
                  onSave={(time) => {
                    if (editing) updateCustom(time)
                    else addCustom(time)
                    setEditing(null)
                    setShowForm(false)
                  }}
                  onCancel={() => {
                    setEditing(null)
                    setShowForm(false)
                  }}
                />
              </div>
            )}

            {customTimes.length === 0 && !showForm && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No custom development times yet.</p>
                <p className="text-sm mt-1">
                  Add your own recipes to use in the calculator.
                </p>
              </div>
            )}

            {customTimes.map((ct) => (
              <div
                key={ct.id}
                className="p-4 bg-card rounded-lg border border-border shadow-sm flex items-start justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium">{ct.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {ct.filmName} in {ct.developerName} (
                    {normalizeDilutionDisplay(ct.dilution)})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ISO {ct.iso} · {formatTime(ct.time * 60)} @ {ct.temperature}°C ·{" "}
                    {ct.format}
                  </p>
                  {ct.notes && (
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      {ct.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => setEditing(ct)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => removeCustom(ct.id)}
                    className="p-1.5 rounded hover:bg-muted text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
