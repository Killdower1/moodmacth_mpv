"use client"

import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const router = useRouter()
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }
  return (
    <AppShell>
      <div className="container mx-auto max-w-md px-4">
        <h1 className="mb-4 text-lg font-semibold">Settings</h1>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
    </AppShell>
  )
}