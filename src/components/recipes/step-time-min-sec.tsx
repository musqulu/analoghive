"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { formatMmSs, parseMmSs } from "@/utils/minutes-seconds"

const inputClass = "ds-input font-mono tabular-nums"

interface StepTimeMinSecProps {
  label: string
  idPrefix: string
  valueDecimalMinutes: number
  onChange: (decimalMinutes: number) => void
  className?: string
}

export function StepTimeMinSec({
  label,
  idPrefix,
  valueDecimalMinutes,
  onChange,
  className,
}: StepTimeMinSecProps) {
  const [focused, setFocused] = React.useState(false)
  const [draft, setDraft] = React.useState(() => formatMmSs(valueDecimalMinutes))

  React.useEffect(() => {
    if (!focused) {
      setDraft(formatMmSs(valueDecimalMinutes))
    }
  }, [valueDecimalMinutes, focused])

  const commit = (raw: string) => {
    const parsed = parseMmSs(raw)
    if (parsed !== null) {
      onChange(parsed)
      setDraft(formatMmSs(parsed))
    } else {
      setDraft(formatMmSs(valueDecimalMinutes))
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={idPrefix} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={idPrefix}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        placeholder="m:ss"
        value={focused ? draft : formatMmSs(valueDecimalMinutes)}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => {
          setFocused(true)
          setDraft(formatMmSs(valueDecimalMinutes))
        }}
        onBlur={() => {
          setFocused(false)
          commit(draft)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur()
          }
        }}
        className={inputClass}
      />
    </div>
  )
}
