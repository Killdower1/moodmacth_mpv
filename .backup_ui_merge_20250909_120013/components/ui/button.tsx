import * as React from "react";
import { cn } from "@/lib/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
}

const variantClasses = {
  default:
    "bg-primary text-primary-foreground border border-transparent hover:opacity-90",
  outline:
    "bg-transparent border border-input text-foreground hover:bg-accent hover:text-accent-foreground",
  ghost:
    "bg-transparent border border-transparent hover:bg-accent hover:text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground border border-transparent hover:opacity-90",
  secondary:
    "bg-secondary text-secondary-foreground border border-transparent hover:opacity-90",
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export default Button;