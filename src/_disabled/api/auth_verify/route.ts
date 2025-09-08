import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyPreauth, createSession } from "@/lib/auth"

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}))
  const jar = cookies()
  const pre = verifyPreauth(jar.get("preauth")?.value)
  if (!pre) return NextResponse.json({ error: "OTP kadaluarsa / invalid" }, { status: 401 })
  if (!code || code !== pre.otp) return NextResponse.json({ error: "Kode salah" }, { status: 401 })

  const session = createSession(pre.email)
  jar.set("session", session, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 60 * 24 * 7 // 7 hari
  })
  jar.delete("preauth")
  return NextResponse.json({ ok: true })
}
