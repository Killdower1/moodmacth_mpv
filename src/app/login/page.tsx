"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("demo123")
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const requestOtp = async () => {
    setLoading(true); setErr(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data?.error || "Gagal login")
      setSent(true)
      setDevOtp(data.devOtp) // tampilkan OTP dev (local only)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setLoading(true); setErr(null)
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp })
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data?.error || "OTP salah")
      router.push("/mood")
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80dvh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{sent ? "Masukkan OTP" : "Masuk dengan Email"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!sent ? (
            <>
              <Input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              {err && <p className="text-sm text-red-500">{err}</p>}
              <Button className="w-full" onClick={requestOtp} disabled={loading}>
                {loading ? "Memproses..." : "Kirim Kode OTP"}
              </Button>
              <p className="text-xs text-muted-foreground">Demo user: demo@example.com / demo123</p>
            </>
          ) : (
            <>
              <Input placeholder="6 digit OTP" value={otp} maxLength={6} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} />
              {devOtp && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-2 py-1 text-xs">
                  <span className="opacity-70">DEV OTP:</span><b>{devOtp}</b>
                </div>
              )}
              {err && <p className="text-sm text-red-500">{err}</p>}
              <div className="flex gap-2">
                <Button className="w-full" onClick={verifyOtp} disabled={loading || otp.length < 6}>
                  {loading ? "Memverifikasi..." : "Verifikasi"}
                </Button>
                <Button variant="outline" onClick={() => { setSent(false); setOtp(""); setDevOtp(null) }}>
                  Ubah Email
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}