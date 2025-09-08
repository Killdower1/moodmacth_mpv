"use client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const schemaCred = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(4, "Minimal 4 karakter")
})

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"cred"|"otp">("cred")
  const [devCode, setDevCode] = useState<string>("")
  const form = useForm({ resolver: zodResolver(schemaCred), defaultValues: { email: "", password: "" } })

  const submitCred = async (values: any) => {
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values)
    })
    const data = await res.json()
    if (!res.ok) return alert(data?.error || "Login gagal")
    setDevCode(data.devCode) // tampilkan buat dev
    setStep("otp")
  }

  return (
    <div className="flex min-h-[80dvh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>{step==="cred" ? "Masuk (Email & Password)" : "Verifikasi OTP"}</CardTitle></CardHeader>
        <CardContent>
          {step === "cred" ? (
            <form onSubmit={form.handleSubmit(submitCred)} className="space-y-4">
              <Input placeholder="email@domain.com" {...form.register("email")} />
              <Input type="password" placeholder="••••••••" {...form.register("password")} />
              <Button className="w-full" type="submit">Kirim OTP</Button>
            </form>
          ) : (
            <OTPForm devCode={devCode} onSuccess={() => router.push("/home")} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function OTPForm({ devCode, onSuccess }: { devCode: string; onSuccess: () => void }) {
  const [code, setCode] = useState("")
  const inputs = Array.from({ length: 6 }).map(() => useRef<HTMLInputElement>(null))
  useEffect(() => { inputs[0].current?.focus() }, [])
  const setAt = (i:number, v:string) => setCode(prev => prev.substring(0,i) + v + prev.substring(i+1))
  const onPaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault()
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const padded = (p + "______").slice(0, 6)
    setCode(padded); inputs[Math.min(p.length,5)].current?.focus()
  }
  const verify = async () => {
    if (code.length !== 6 || /_/.test(code)) return alert("Masukkan 6 digit")
    const res = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) })
    const data = await res.json()
    if (!res.ok) return alert(data?.error || "Kode salah")
    onSuccess()
  }
  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">Kode uji: <span className="font-mono">{devCode}</span></div>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input key={i} ref={inputs[i]} value={code[i] ?? ""} maxLength={1} inputMode="numeric"
            onChange={e => { const d = e.target.value.replace(/\D/g,"").slice(0,1); setAt(i,d); if(d && i<5) inputs[i+1].current?.focus() }}
            onKeyDown={e => { if(e.key==="Backspace"){ if(!code[i] && i>0) inputs[i-1].current?.focus(); setAt(i,"") }}}
            onPaste={onPaste}
            className="h-12 w-full rounded-xl border bg-background text-center text-xl outline-none focus:ring"
          />
        ))}
      </div>
      <Button className="w-full" onClick={verify}>Verifikasi</Button>
    </div>
  )
}
