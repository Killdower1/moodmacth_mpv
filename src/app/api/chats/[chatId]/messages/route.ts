import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";

async function ensureMember(chatId: string, userId: string) {
  const c = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { match: { select: { userAId: true, userBId: true } } },
  });
  if (!c) throw new Response("CHAT_NOT_FOUND", { status: 404 });
  const { userAId, userBId } = c.match;
  if (userAId !== userId && userBId !== userId) throw new Response("FORBIDDEN", { status: 403 });
}

export async function GET(_: Request, { params }: { params: { chatId: string } }) {
  const userId = await getSessionUserId();
  await ensureMember(params.chatId, userId);

  const messages = await prisma.message.findMany({
    where: { chatId: params.chatId },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, senderId: true, type: true, text: true, imageUrl: true, locLat: true, locLng: true, createdAt: true },
  });
  return NextResponse.json({ messages, me: userId });
}

export async function POST(req: Request, { params }: { params: { chatId: string } }) {
  const userId = await getSessionUserId();
  await ensureMember(params.chatId, userId);

  const body = await req.json() as { type?: "TEXT"|"IMAGE"|"LOCATION"|"SYSTEM"|"CALL"; text?: string };
  const type = body.type ?? "TEXT";
  const text = body.text;

  if (type === "TEXT" && (!text || !text.trim())) {
    return NextResponse.json({ error: "EMPTY_TEXT" }, { status: 400 });
  }

  const msg = await prisma.message.create({
    data: {
      chatId: params.chatId,
      senderId: userId,
      type,
      text: type === "TEXT" ? text!.trim() : null,
    },
  });

  await prisma.chat.update({ where: { id: params.chatId }, data: { updatedAt: new Date() } });
  return NextResponse.json({ ok: true, message: msg });
}