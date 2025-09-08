import * as React from "react"
import { cn } from "@/lib/cn"
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl border bg-background px-3 py-2 text-sm",
      "outline-none ring-0 focus:ring-2 focus:ring-primary/30",
      className
    )}
    {...props}
  />
))
Input.displayName = "Input"
