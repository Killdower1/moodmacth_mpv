import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getEmailFromToken } from "@/lib/mock-auth"
import { candidatesFor } from "@/lib/mock-data"

export async function GET() {
  const token = cookies().get("session")?.value
  const email = getEmailFromToken(token ?? null)
  if (!email) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 })
  const list = candidatesFor(email)
  return NextResponse.json({ ok:true, data: list })
}