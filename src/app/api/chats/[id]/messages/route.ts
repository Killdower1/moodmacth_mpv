import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";

async function ensureMember(id: string, userId: string) {
  const c = await prisma.chat.findUnique({
    where: { id: id },
    select: { match: { select: { userAId: true, userBId: true } } },
  });
  if (!c) throw new Response("CHAT_NOT_FOUND", { status: 404 });
  const { userAId, userBId } = c.match;
  if (userAId !== userId && userBId !== userId) throw new Response("FORBIDDEN", { status: 403 });
}

export async function GET(_: Request, { params }: { params: { id: string }) {
  const userId = await getSessionUserId();
  await ensureMember(params.id, userId);

  const messages = await prisma.message.findMany({
    where: { id: params.id },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, senderId: true, type: true, text: true, imageUrl: true, locLat: true, locLng: true, createdAt: true },
  });
  return NextResponse.json({ messages, me: userId });
}

export async function POST(req: Request, { params }: { params: { id: string }) {
  const userId = await getSessionUserId();
  await ensureMember(params.id, userId);

  const body = await req.json() as { type?: "TEXT"|"IMAGE"|"LOCATION"|"SYSTEM"|"CALL"; text?: string };
  const type = body.type ?? "TEXT";
  const text = body.text;

  if (type === "TEXT" && (!text || !text.trim())) {
    return NextResponse.json({ error: "EMPTY_TEXT" }, { status: 400 });
  }

  const msg = await prisma.message.create({
    data: {
      id: params.id,
      senderId: userId,
      type,
      text: type === "TEXT" ? text!.trim() : null,
    },
  });

  await prisma.chat.update({ where: { id: params.id }, data: { updatedAt: new Date() } });
  return NextResponse.json({ ok: true, message: msg });
}