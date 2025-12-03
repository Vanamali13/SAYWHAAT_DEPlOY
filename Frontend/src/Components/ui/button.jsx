import React from 'react';
import { cn } from '../../utils/utils';

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? "div" : "button";
  const variants = {
    default: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
    destructive: "bg-red-900 text-zinc-100 hover:bg-red-900/90",
    outline: "border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-100",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-800/80",
    ghost: "hover:bg-zinc-800 hover:text-zinc-100",
    link: "text-zinc-100 underline-offset-4 hover:underline",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <Comp
      className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
