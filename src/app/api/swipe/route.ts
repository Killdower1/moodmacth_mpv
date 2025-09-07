import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { startOfDay } from "date-fns";

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const { targetId, action } = await req.json();

    if (!targetId || !["LIKE", "DISLIKE"].includes(action)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const today = startOfDay(new Date());
    const count = await prisma.swipe.count({
      where: { fromId: me.id, createdAt: { gte: today } },
    });
    if (count >= 100) return NextResponse.json({ error: "Daily swipe limit" }, { status: 429 });

    await prisma.user.update({ where: { id: me.id }, data: { lastActiveAt: new Date() } });

    const swipe = await prisma.swipe.upsert({
      where: { fromId_toId: { fromId: me.id, toId: targetId } },
      update: { action },
      create: { fromId: me.id, toId: targetId, action },
    });

    let matched = false;
    let matchId: string | undefined;

    if (action === "LIKE") {
      const theyLiked = await prisma.swipe.findUnique({
        where: { fromId_toId: { fromId: targetId, toId: me.id } },
      });
      if (theyLiked?.action === "LIKE") {
        const a = me.id < targetId ? me.id : targetId;
        const b = me.id < targetId ? targetId : me.id;

        const match = await prisma.match.upsert({
          where: { userAId_userBId: { userAId: a, userBId: b } },
          update: {},
          create: { userAId: a, userBId: b },
        });

        await prisma.notification.createMany({
          data: [
            { userId: me.id, type: "MATCH", entityId: match.id },
            { userId: targetId, type: "MATCH", entityId: match.id },
          ],
          skipDuplicates: true,
        });

        matched = true;
        matchId = match.id;
      }
    }

    return NextResponse.json({ ok: true, matched, matchId, swipe });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const me = await requireUser();
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");
    if (!targetId) return NextResponse.json({ error: "targetId required" }, { status: 400 });

    const a = me.id < targetId ? me.id : targetId;
    const b = me.id < targetId ? targetId : me.id;
    const alreadyMatched = await prisma.match.findUnique({
      where: { userAId_userBId: { userAId: a, userBId: b } },
      select: { id: true },
    });
    if (alreadyMatched) return NextResponse.json({ error: "Already matched" }, { status: 409 });

    await prisma.swipe.delete({ where: { fromId_toId: { fromId: me.id, toId: targetId } } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}
