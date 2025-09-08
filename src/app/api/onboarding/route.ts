import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getEmailFromToken } from "@/lib/mock-auth"
import { setPrefs } from "@/lib/mock-data"

export async function POST(req: Request) {
  const token = cookies().get("session")?.value
  const email = getEmailFromToken(token ?? null)
  if (!email) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const pref = {
    mood: Array.isArray(body?.mood) ? body.mood : undefined,
    gender: Array.isArray(body?.gender) ? body.gender : undefined,
    ageMin: typeof body?.ageMin === "number" ? body.ageMin : undefined,
    ageMax: typeof body?.ageMax === "number" ? body.ageMax : undefined,
  }
  setPrefs(email, pref)
  return NextResponse.json({ ok:true })
}