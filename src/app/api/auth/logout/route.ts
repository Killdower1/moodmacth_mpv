import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  const jar = cookies()
  jar.delete("session")
  jar.delete("preauth")
  return NextResponse.json({ ok: true })
}
