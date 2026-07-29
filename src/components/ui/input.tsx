import * as React from "react"
import { cn } from "@/lib/utils"
import { applyMask, MaskType } from "@/lib/format"

export interface InputProps extends React.ComponentProps<"input"> {
  mask?: MaskType
}

function Input({ className, type, mask, onChange, value, ...props }: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mask) {
      const masked = applyMask(e.target.value, mask)
      e.target.value = masked
    }
    if (onChange) {
      onChange(e)
    }
  }

  const displayValue = mask && typeof value === "string" ? applyMask(value, mask) : value

  return (
    <input
      type={type}
      data-slot="input"
      value={displayValue}
      onChange={handleChange}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }

