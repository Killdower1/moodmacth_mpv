import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createPreauth, generateOTP } from "@/lib/auth"

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}))
  if (!email || !password) {
    return NextResponse.json({ error: "Email & password wajib" }, { status: 400 })
  }
  // TODO: validasi sebenarnya ke DB. Sekarang terima semua yang diisi.
  const otp = generateOTP()
  const pre = createPreauth(email, otp, 5 * 60 * 1000) // 5 menit
  cookies().set("preauth", pre, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 5
  })
  // devCode dikirim balik biar bisa dites tanpa SMS
  return NextResponse.json({ ok: true, devCode: otp })
}
