import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { requireUser } from "@/lib/auth";
import { startOfDay } from "date-fns";
import { toIntId } from "@/lib/id";

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const meId = toIntId(me.id);
    const { targetId: targetIdRaw, action } = await req.json();
    if (!targetIdRaw || !["LIKE", "DISLIKE"].includes(action)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    const targetId = toIntId(targetIdRaw);

    const today = startOfDay(new Date());
    const count = await prisma.swipe.count({
      where: { fromId: meId, createdAt: { gte: today } },
    });
    if (count >= 100) return NextResponse.json({ error: "Daily swipe limit" }, { status: 429 });

    await prisma.user.update({ where: { id: meId }, data: { lastActiveAt: new Date() } });

    const swipe = await prisma.swipe.upsert({
      where: { fromId_toId: { fromId: meId, toId: targetId } },
      update: { action },
      create: { fromId: meId, toId: targetId, action },
    });

    let matched = false;
    let matchId: string | undefined;
    let conversationId: string | undefined;

    if (action === "LIKE") {
      const theyLiked = await prisma.swipe.findUnique({
        where: { fromId_toId: { fromId: targetId, toId: meId } },
      });
      if (theyLiked?.action === "LIKE") {
        const a = meId < targetId ? meId : targetId;
        const b = meId < targetId ? targetId : meId;

        const [match, conversation] = await prisma.$transaction([
          prisma.match.upsert({
            where: { userAId_userBId: { userAId: a, userBId: b } },
            update: {},
            create: { userAId: a, userBId: b },
          }),
          prisma.conversation.upsert({
            where: { userAId_userBId: { userAId: a, userBId: b } },
            update: {},
            create: { userAId: a, userBId: b },
          }),
        ]);

        await prisma.notification.createMany({
          data: [
            { userId: meId, type: "MATCH", entityId: match.id },
            { userId: targetId, type: "MATCH", entityId: match.id },
          ],
          skipDuplicates: true,
        });

        matched = true;
        matchId = match.id;
        conversationId = conversation.id;
      }
    }

    return NextResponse.json({ ok: true, matched, matchId, conversationId, swipe });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const me = await requireUser();
    const meId = toIntId(me.id);
    const { searchParams } = new URL(req.url);
    const targetIdParam = searchParams.get("targetId");
    if (!targetIdParam) return NextResponse.json({ error: "targetId required" }, { status: 400 });
    const targetId = toIntId(targetIdParam);

    const a = meId < targetId ? meId : targetId;
    const b = meId < targetId ? targetId : meId;
    const alreadyMatched = await prisma.match.findUnique({
      where: { userAId_userBId: { userAId: a, userBId: b } },
      select: { id: true },
    });
    if (alreadyMatched) return NextResponse.json({ error: "Already matched" }, { status: 409 });

    await prisma.swipe.delete({ where: { fromId_toId: { fromId: meId, toId: targetId } } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}

