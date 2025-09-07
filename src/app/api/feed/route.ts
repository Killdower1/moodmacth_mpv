import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { requireUser } from "@/lib/auth";
import { calcAge } from "@/lib/age";
import { Mood } from "@prisma/client";
import { toIntId } from "@/lib/id";
import { getCurrentMood } from "@/lib/mood";

export async function GET(req: Request) {
  try {
    const meUser = await requireUser();
    const meId = toIntId(meUser.id);

    const url = new URL(req.url);
    const qMood = url.searchParams.get("mood") as Mood | null;
    const mood = qMood ?? await getCurrentMood(meId);

    const pref = await prisma.preference.findUnique({ where: { userId: meId } });

    const swiped = await prisma.swipe.findMany({ where: { fromId: meId }, select: { toId: true } });
    const matchedA = await prisma.match.findMany({ where: { userAId: meId }, select: { userBId: true } });
    const matchedB = await prisma.match.findMany({ where: { userBId: meId }, select: { userAId: true } });
    const blocks1 = await prisma.block.findMany({ where: { byId: meId }, select: { targetId: true } });
    const blocks2 = await prisma.block.findMany({ where: { targetId: meId }, select: { byId: true } });

    const excludeIds = new Set<number>([
      meId,
      ...swiped.map(s => s.toId),
      ...matchedA.map(m => m.userBId),
      ...matchedB.map(m => m.userAId),
      ...blocks1.map(b => b.targetId),
      ...blocks2.map(b => b.byId),
    ]);

    const candidate = await prisma.user.findFirst({
      where: {
        id: { notIn: Array.from(excludeIds) },
        ...(pref?.preferredGenders?.length ? { gender: { in: pref.preferredGenders } } : {}),
        // TODO: filter by birthdate range
        // mood filtering skipped for now
      },
      orderBy: [{ lastActiveAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        gender: true,
        birthdate: true,
        photos: true,
      },
    });

    if (!candidate) return NextResponse.json({ profile: null });

    const photo = candidate.photos?.find?.((p:any)=>p.isPrimary)?.url
             ?? candidate.photos?.[0]?.url
             ?? "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/1.jpg";

    const age = calcAge(candidate.birthdate) ?? 21;

    return NextResponse.json({
      profile: { id: candidate.id, name: candidate.name, age, gender: candidate.gender ?? "other", photo }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}


