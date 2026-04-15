"use client"

import * as React from "react"
import type { CustomDevelopmentTime, FilmFormat } from "@/types/development"

interface CustomTimeFormProps {
  initial?: CustomDevelopmentTime
  onSave: (time: CustomDevelopmentTime) => void
  onCancel: () => void
}

const FORMATS: FilmFormat[] = ["35mm", "120", "sheet"]

export function CustomTimeForm({ initial, onSave, onCancel }: CustomTimeFormProps) {
  const [label, setLabel] = React.useState(initial?.label ?? "")
  const [filmName, setFilmName] = React.useState(initial?.filmName ?? "")
  const [developerName, setDeveloperName] = React.useState(initial?.developerName ?? "")
  const [dilution, setDilution] = React.useState(initial?.dilution ?? "1+50")
  const [iso, setIso] = React.useState(initial?.iso?.toString() ?? "400")
  const [time, setTime] = React.useState(initial?.time?.toString() ?? "10")
  const [temperature, setTemperature] = React.useState(initial?.temperature?.toString() ?? "20")
  const [format, setFormat] = React.useState<FilmFormat>(initial?.format ?? "35mm")
  const [notes, setNotes] = React.useState(initial?.notes ?? "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      label: label || `${filmName} in ${developerName}`,
      filmName,
      developerName,
      dilution,
      iso: parseInt(iso),
      time: parseFloat(time),
      temperature: parseFloat(temperature),
      format,
      notes: notes || undefined,
      source: "custom",
      createdAt: initial?.createdAt ?? Date.now(),
    })
  }

  const inputClass = "ds-input"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Label (optional)</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. My go-to HP5 recipe"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Film</label>
          <input
            type="text"
            value={filmName}
            onChange={(e) => setFilmName(e.target.value)}
            required
            placeholder="e.g. HP5 Plus"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Developer</label>
          <input
            type="text"
            value={developerName}
            onChange={(e) => setDeveloperName(e.target.value)}
            required
            placeholder="e.g. Rodinal"
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Dilution</label>
          <input
            type="text"
            value={dilution}
            onChange={(e) => setDilution(e.target.value)}
            required
            placeholder="1+50"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">ISO</label>
          <input
            type="number"
            value={iso}
            onChange={(e) => setIso(e.target.value)}
            required
            min="1"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as FilmFormat)}
            className={inputClass}
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Time (min)</label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            min="0.1"
            step="0.1"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Temperature (°C)</label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            required
            step="0.1"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any additional notes..."
          className={`${inputClass} min-h-[4.5rem] items-start py-2`}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {initial ? "Update" : "Save"}
        </button>
      </div>
    </form>
  )
}
