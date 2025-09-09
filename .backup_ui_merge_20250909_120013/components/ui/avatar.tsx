import * as React from "react"
import { cn } from "@/lib/cn"
export function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-muted", className)} {...props}>{children}</div>
}
export function AvatarImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img className="h-full w-full object-cover" {...props} />
}
export function AvatarFallback({ children }: { children?: React.ReactNode }) {
  return <span className="text-sm font-medium text-muted-foreground">{children}</span>
}
