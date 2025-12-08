import React from "react"
import { Check } from "lucide-react"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
        <div
            className={`peer h-4 w-4 shrink-0 rounded-sm border border-zinc-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-zinc-50 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=checked]:bg-zinc-50 dark:data-[state=checked]:text-zinc-900 ${checked ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black" : "bg-transparent"
                } ${className}`}
            onClick={() => onCheckedChange && onCheckedChange(!checked)}
            {...props}
        >
            {checked && <Check className="h-4 w-4" />}
        </div>
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
