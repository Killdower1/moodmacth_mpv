import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getEmailFromToken } from "@/lib/mock-auth"
import { addLike, addBlock } from "@/lib/mock-data"

async function handle(req: Request) {
  const token = cookies().get("session")?.value
  const email = getEmailFromToken(token ?? null)
  if (!email) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const id = String(body?.id ?? "")
  const action = String(body?.action ?? body?.type ?? "like") // fallback
  if (!id) return NextResponse.json({ ok:false, error:"Missing id" }, { status: 400 })

  if (action === "dislike" || action === "skip") addBlock(email, id)
  else addLike(email, id)

  const isMatch = false  // dummy selalu false
  return NextResponse.json({ ok:true, match: isMatch })
}

export async function POST(req: Request) { return handle(req) }