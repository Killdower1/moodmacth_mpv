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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId();
  await ensureMember(params.id, userId);

  const messages = await prisma.message.findMany({
    where: { chatId: params.id },
    orderBy: { createdAt: "asc" },
    take: 200,
    // Hanya field yang ada di schema sekarang
    select: { id: true, senderId: true, text: true, createdAt: true },
  });
  return NextResponse.json({ messages, me: userId });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId();
  await ensureMember(params.id, userId);

  const body = await req.json() as { text?: string };
  const text = (body.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "EMPTY_TEXT" }, { status: 400 });

  const msg = await prisma.message.create({
    data: {
      chatId: params.id,
      senderId: userId,
      text,
    },
  });

  await prisma.chat.update({ where: { id: params.id }, data: { updatedAt: new Date() } });
  return NextResponse.json({ ok: true, message: msg });
}