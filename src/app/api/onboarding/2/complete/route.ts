import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession, setSessionCookie } from "@/lib/session";

export async function POST() {
  const sess = readSession();
  if (!sess?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await prisma.photo.count({ where: { userId: sess.uid } });
  if (count === 0) return NextResponse.json({ error: "Upload minimal 1 foto" }, { status: 400 });

  // pastikan ada primary; kalau belum, set foto terbaru jadi primary
  const prim = await prisma.photo.findFirst({ where: { userId: sess.uid, isPrimary: true } });
  if (!prim) {
    const latest = await prisma.photo.findFirst({
      where: { userId: sess.uid },
      orderBy: { createdAt: "desc" },
      select: { id: true }
    });
    if (latest) {
      await prisma.photo.update({ where: { id: latest.id }, data: { isPrimary: true } });
    }
  }

  const u = await prisma.user.update({
    where: { id: sess.uid },
    data: { onboardingStep: 2 },
    select: { onboardingStep: true }
  });

  // refresh cookie step (kalau kamu simpan step di cookie)
  setSessionCookie({ uid: sess.uid, step: u.onboardingStep });

  return NextResponse.json({ ok: true, next: "/onboarding/3" });
}