import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { match: { userAId: userId } },
        { match: { userBId: userId } },
      ],
    },
    include: {
      match: {
        select: { id: true, userAId: true, userBId: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        // NOTE: 'type' sudah tidak ada di Message schema saat ini
        select: { id: true, text: true, createdAt: true },
      },
    },
    // 'updatedAt' milik Chat (aman)
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ chats });
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { matchId } = await req.json();
  const m = await prisma.match.findUnique({ where: { id: matchId } });
  if (!m) return NextResponse.json({ error: "MATCH_NOT_FOUND" }, { status: 404 });
  if (m.userAId !== userId && m.userBId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const chat = await prisma.chat.upsert({
    where: { matchId },
    update: {},
    create: { matchId },
    include: { match: true },
  });

  return NextResponse.json({ chat });
}