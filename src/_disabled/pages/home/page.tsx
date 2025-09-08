import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"

export default async function HomePage() {
  const token = cookies().get("session")?.value
  const session = verifySession(token)
  return (
    <AppShell>
      <Card>
        <CardContent className="p-4">
          <div className="text-lg font-semibold">Selamat datang{session?.email ? `, ${session.email}` : ""}!</div>
          <div className="text-sm text-muted-foreground">Kamu berhasil login lewat email+password → OTP → session.</div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
