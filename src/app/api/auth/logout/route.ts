import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { destroySession } from "@/lib/mock-auth"

export async function POST() {
  const token = cookies().get("session")?.value
  destroySession(token ?? null)
  const res = NextResponse.json({ ok: true })
  res.cookies.set("session", "", { path: "/", maxAge: 0 })
  return res
}