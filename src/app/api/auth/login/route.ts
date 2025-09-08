import { NextResponse } from "next/server"
import { users, issueOtp } from "@/lib/mock-auth"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const ok = users.some(u => u.email === email && u.password === password)
  if (!ok) return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 })

  const code = issueOtp(email)
  console.log("[DEV] OTP for", email, "=", code)
  return NextResponse.json({ ok: true, devOtp: code })
}