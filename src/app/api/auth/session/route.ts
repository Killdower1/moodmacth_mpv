import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { readSession } from "@/lib/session-cookie";

export async function GET() {
  const s = readSession();
  if (!s?.userId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: String(s.userId) },
    select: { id: true, email: true, name: true },
  });
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, user });
}