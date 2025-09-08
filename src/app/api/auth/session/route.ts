import { NextResponse } from "next/server";
import { readSession } from "@/lib/session-cookie";
import { prisma } from "@/server/prisma";

export async function GET() {
  const s = readSession();
  if (!s?.userId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Coba ambil user dari DB (opsional). Kalau gagal atau tidak ketemu, tetap OK.
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(s.userId) },
      select: { id: true, email: true, name: true },
    });
    if (user) {
      return NextResponse.json({ ok: true, user });
    }
  } catch {
    // abaikan error lookup
  }

  // fallback: minimal info dari cookie
  return NextResponse.json({ ok: true, user: { id: String(s.userId) } });
}