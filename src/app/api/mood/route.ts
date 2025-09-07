import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Mood } from "@prisma/client";
import { toIntId } from "@/lib/id";

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const { mood } = await req.json();
    if (!mood || !(Object.values(Mood) as string[]).includes(mood)) {
      return NextResponse.json({ error: "mood required" }, { status: 400 });
    }
    const userId = toIntId(me.id);
    await prisma.moodSession.updateMany({
      where: { userId, active: true },
      data: { active: false },
    });
    await prisma.moodSession.create({
      data: {
        userId,
        mood,
        startedAt: new Date(),
        expiresAt: null,
        active: true,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}
