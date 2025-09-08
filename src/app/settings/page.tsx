"use client"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Tema saat ini: {theme}</div>
        <div className="flex gap-2">
          <Button onClick={() => setTheme("light")}>Light</Button>
          <Button onClick={() => setTheme("dark")}>Dark</Button>
          <Button onClick={() => setTheme("system")}>System</Button>
        </div>
        <Button variant="outline">Logout</Button>
      </div>
    </AppShell>
  )
}
