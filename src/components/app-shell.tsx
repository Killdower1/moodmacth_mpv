import { BottomNav } from "@/components/bottom-nav"
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="container mx-auto max-w-md pb-20 pt-4">{children}</div>
      <BottomNav />
    </div>
  )
}
