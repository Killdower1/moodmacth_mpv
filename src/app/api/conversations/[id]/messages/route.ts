
import { requireUser } from "@/lib/auth";
import { prisma } from "@/server/prisma";
import { toIntId } from "@/lib/id";
import { z } from "zod";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const me = await requireUser();
  const meId = toIntId(me.id);

  const convIdNum = Number(params.id);
  const convWhere: any = Number.isInteger(convIdNum) ? { id: convIdNum } : { id: params.id };

  const conv = await prisma.conversation.findUnique({
    where: convWhere,
    select: { id: true, userAId: true, userBId: true },
  });
  if (!conv || (conv.userAId !== meId && conv.userBId !== meId)) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: conv.id as any },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return new Response(JSON.stringify({ messages }), { headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await requireUser();
  const meId = toIntId(me.id);

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ text: z.string().min(1).max(2000) }).safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: "Bad request" }), { status: 400 });
  const { text } = parsed.data;

  const convIdNum = Number(params.id);
  const convWhere: any = Number.isInteger(convIdNum) ? { id: convIdNum } : { id: params.id };

  const conv = await prisma.conversation.findUnique({
    where: convWhere,
    select: { id: true, userAId: true, userBId: true },
  });
  if (!conv || (conv.userAId !== meId && conv.userBId !== meId)) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  const msg = await prisma.message.create({
    data: { conversationId: conv.id as any, senderId: meId, text },
  });

  return new Response(JSON.stringify({ message: msg }), { headers: { "Content-Type": "application/json" } });
}
