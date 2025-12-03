import React from 'react';
import { cn } from '../../utils/utils';

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80",
    secondary: "border-transparent bg-zinc-800 text-zinc-100 hover:bg-zinc-800/80",
    destructive: "border-transparent bg-red-900 text-zinc-100 hover:bg-red-900/80",
    outline: "text-zinc-100 border-zinc-800",
  };
  return (
    <div
      className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}
      ref={ref}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
