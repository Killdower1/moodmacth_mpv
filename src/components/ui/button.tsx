import * as React from "react"
import { cn } from "@/lib/cn"
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent",
      "px-4 py-2 text-sm font-medium transition-colors",
      "bg-primary text-primary-foreground hover:opacity-90",
      "disabled:opacity-50 disabled:pointer-events-none",
      className
    )}
    {...props}
  />
))
Button.displayName = "Button"
