'use client'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const schema = z.object({ phone: z.string().regex(/^0\d{9,13}$/, "Masukkan nomor HP yang valid") })

export default function LoginPage() {
  const router = useRouter()
  const [sent, setSent] = useState(false)
  const [testCode, setTestCode] = useState("")   // kode OTP dummy
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { phone: "" } })

  const onSubmit = (values: any) => {
    // generate 6 digit random utk testing
    const gen = Math.floor(100000 + Math.random() * 900000).toString()
    setTestCode(gen)
    setSent(true)
  }

  return (
    <div className="flex min-h-[80dvh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Masuk dengan Nomor HP</CardTitle></CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Input placeholder="08xxxxxxxxxx" {...form.register("phone")} />
              <Button className="w-full" type="submit">Kirim Kode</Button>
            </form>
          ) : (
            <OTPForm
              testCode={testCode}
              onSuccess={() => router.push("/mood")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function OTPForm({ testCode, onSuccess }: { testCode: string; onSuccess: () => void }) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const inputs = Array.from({ length: 6 }).map(() => useRef<HTMLInputElement>(null))

  useEffect(() => { inputs[0].current?.focus() }, [])

  const setAt = (i: number, v: string) => {
    const next = code.substring(0, i) + v + code.substring(i + 1)
    setCode(next)
  }

  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 1)
    setAt(i, d)
    if (d && i < 5) inputs[i + 1].current?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!code[i] && i > 0) inputs[i - 1].current?.focus()
      setAt(i, "")
    }
  }

  const onPaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault()
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const padded = (p + "______").slice(0, 6)
    setCode(padded)
    inputs[Math.min(p.length, 5)].current?.focus()
  }

  const verify = () => {
    setError("")
    if (code.length !== 6 || /_/.test(code)) return setError("Masukkan 6 digit.")
    if (code !== testCode) return setError("Kode salah. Coba lagi.")
    onSuccess()
  }

  return (
    <div className="space-y-4">
      {/* Untuk testing/dev – tampilkan kode dummy */}
      <div className="text-xs text-muted-foreground">Kode uji: <span className="font-mono">{testCode}</span></div>

      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={inputs[i]}
            value={code[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={onPaste}
            maxLength={1}
            inputMode="numeric"
            className="h-12 w-full rounded-xl border bg-background text-center text-xl outline-none focus:ring"
          />
        ))}
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <Button className="w-full" onClick={verify}>Verifikasi</Button>
    </div>
  )
}
