import { NextResponse } from "next/server"
import { verifyOtp, createSession } from "@/lib/mock-auth"

export async function POST(req: Request) {
  const { email, code } = await req.json()
  if (!verifyOtp(email, code)) {
    return NextResponse.json({ ok: false, error: "Invalid OTP" }, { status: 400 })
  }
  const token = createSession(email)
  const res = NextResponse.json({ ok: true })
  res.cookies.set("session", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 })
  return res
}