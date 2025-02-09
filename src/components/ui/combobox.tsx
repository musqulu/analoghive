"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import * as PopoverPrimitive from "@radix-ui/react-popover"

interface ComboboxProps {
  options: { name: string; type: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Combobox({ options, value, onChange, placeholder = "Select an option..." }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {value ? options.find(option => option.name === value)?.name : placeholder}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-0 bg-popover rounded-md border shadow-md"
          align="start"
        >
          <div className="p-2">
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="Search films..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-auto">
            {filteredOptions.length === 0 && (
              <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none text-muted-foreground">
                No results found
              </div>
            )}
            {filteredOptions.map((option) => (
              <div
                key={option.name}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === option.name && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  onChange(option.name)
                  setOpen(false)
                  setSearchQuery("")
                }}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {value === option.name && <Check className="h-4 w-4" />}
                </span>
                {option.name} ({option.type})
              </div>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
} 