import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { normalizeProfile } from "@/lib/normalizeProfiles";
import { Mood } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const meUser = await requireUser();
    const me = await prisma.user.findUnique({ where: { id: meUser.id }, select: { id: true, currentMood: true } });
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const moodParam = searchParams.get("mood") as Mood | null;
    const mood = moodParam ?? me.currentMood ?? null;

    const pref = await prisma.preference.findUnique({ where: { userId: me.id } });

    const swiped = await prisma.swipe.findMany({ where: { fromId: me.id }, select: { toId: true } });
    const matchedA = await prisma.match.findMany({ where: { userAId: me.id }, select: { userBId: true } });
    const matchedB = await prisma.match.findMany({ where: { userBId: me.id }, select: { userAId: true } });
    const blocks1 = await prisma.block.findMany({ where: { byId: me.id }, select: { targetId: true } });
    const blocks2 = await prisma.block.findMany({ where: { targetId: me.id }, select: { byId: true } });

    const excludeIds = new Set<string>([
      me.id,
      ...swiped.map(s => s.toId),
      ...matchedA.map(m => m.userBId),
      ...matchedB.map(m => m.userAId),
      ...blocks1.map(b => b.targetId),
      ...blocks2.map(b => b.byId),
    ]);

    const candidate = await prisma.user.findFirst({
      where: {
        id: { notIn: Array.from(excludeIds) },
        ...(pref?.preferredGenders?.length ? { gender: { in: pref!.preferredGenders } } : {}),
        ...(pref ? { age: { gte: pref.minAge, lte: pref.maxAge } } : {}),
        ...(mood ? { currentMood: mood } : {}),
      },
      orderBy: [{ lastActiveAt: "desc" }, { createdAt: "desc" }],
      include: { photos: true },
    });

    if (!candidate) return NextResponse.json({ profile: null });

    const profile = normalizeProfile(candidate);
    return NextResponse.json({ profile });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}
