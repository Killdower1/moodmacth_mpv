import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getEmailFromToken } from "@/lib/mock-auth"

export async function GET() {
  const token = cookies().get("session")?.value
  const email = getEmailFromToken(token ?? null)
  return NextResponse.json({ authenticated: !!email, email: email ?? null })
}