import * as React from "react"
import { cn } from "../../utils/utils"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800",
            className
        )}
        {...props}
    >
        <div
            className="h-full w-full flex-1 bg-zinc-900 dark:bg-zinc-50 transition-all"
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </div>
))
Progress.displayName = "Progress"

export { Progress }
