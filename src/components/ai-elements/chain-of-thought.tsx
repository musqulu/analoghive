"use client"

import { useControllableState } from "@radix-ui/react-use-controllable-state"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, Circle, PlayCircle, type LucideIcon } from "lucide-react"
import {
  createContext,
  type ComponentProps,
  type ReactNode,
  memo,
  useContext,
  useMemo,
} from "react"

type CotStatus = "complete" | "active" | "pending"

interface ChainOfThoughtCtx {
  open: boolean
  setOpen: (v: boolean) => void
}

const CotContext = createContext<ChainOfThoughtCtx | null>(null)

function useChainOfThought() {
  const ctx = useContext(CotContext)
  if (!ctx) throw new Error("ChainOfThought components must nest under ChainOfThought")
  return ctx
}

export type ChainOfThoughtProps = ComponentProps<typeof Collapsible> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const ChainOfThought = memo(
  ({
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    children,
    ...props
  }: ChainOfThoughtProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      prop: open,
    })

    const value = useMemo(
      () => ({ open: isOpen, setOpen: setIsOpen }),
      [isOpen, setIsOpen],
    )

    return (
      <CotContext.Provider value={value}>
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className={cn("rounded-lg border border-border bg-muted/40", className)}
          {...props}
        >
          {children}
        </Collapsible>
      </CotContext.Provider>
    )
  },
)

export type ChainOfThoughtHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  children?: ReactNode
}

export const ChainOfThoughtHeader = memo(
  ({ className, children, ...props }: ChainOfThoughtHeaderProps) => {
    const { open } = useChainOfThought()
    return (
      <CollapsibleTrigger
        type="button"
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium outline-none hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      >
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
        <span>{children ?? "Working"}</span>
      </CollapsibleTrigger>
    )
  },
)

ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader"

const statusIcons: Record<CotStatus, LucideIcon> = {
  complete: Check,
  active: PlayCircle,
  pending: Circle,
}

const stepTone: Record<CotStatus, string> = {
  complete: "text-muted-foreground",
  active: "text-foreground",
  pending: "text-muted-foreground/40",
}

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: LucideIcon
  label: ReactNode
  description?: ReactNode
  status?: CotStatus
}

export const ChainOfThoughtStep = memo(
  ({
    className,
    icon: Icon,
    label,
    description,
    status = "complete",
    children,
    ...props
  }: ChainOfThoughtStepProps) => {
    const StepIcon = Icon ?? statusIcons[status]
    const spin = status === "active"

    return (
      <div
        className={cn(
          "flex gap-2 px-3 py-1.5 text-sm leading-snug",
          stepTone[status],
          className,
        )}
        {...props}
      >
        <StepIcon
          aria-hidden
          className={cn("mt-0.5 h-4 w-4 shrink-0", spin && "animate-spin")}
        />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-foreground">{label}</div>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
          {children}
        </div>
      </div>
    )
  },
)

ChainOfThoughtStep.displayName = "ChainOfThoughtStep"

export type ChainOfThoughtContentProps = ComponentProps<typeof CollapsibleContent>

export const ChainOfThoughtContent = memo(
  ({ className, ...props }: ChainOfThoughtContentProps) => {
    useChainOfThought()
    return (
      <CollapsibleContent
        className={cn(
          "overflow-hidden data-[state=closed]:hidden",
          className,
        )}
        {...props}
      />
    )
  },
)

ChainOfThoughtContent.displayName = "ChainOfThoughtContent"

ChainOfThought.displayName = "ChainOfThought"