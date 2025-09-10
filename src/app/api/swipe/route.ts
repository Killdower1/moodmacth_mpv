import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/server/prisma";

const Body = z.object({ toUserId: z.string().cuid(), action: z.enum(["LIKE","DISLIKE"]) });

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!s?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { toUserId, action } = Body.parse(await req.json());
  const me = String(s.user.id);

  await prisma.swipe.upsert({
    where: { fromId_toId: { fromId: me, toId: toUserId } },
    create: { fromId: me, toId: toUserId, action },
    update: { action },
  });

  let matched = false;
  if (action === "LIKE") {
    const reciprocal = await prisma.swipe.findUnique({
      where: { fromId_toId: { fromId: toUserId, toId: me } },
      select: { action: true },
    });
    if (reciprocal?.action === "LIKE") {
      const [a, b] = [me, toUserId].sort();
      await prisma.match.upsert({
        where: { userAId_userBId: { userAId: a, userBId: b } },
        create: { userAId: a, userBId: b },
        update: {},
      });
      matched = true;
    }
  }
  return NextResponse.json({ ok: true, matched });
}
