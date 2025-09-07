import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getIO } from "@/lib/socket";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await requireUser();
    const id = params.id;
    const conv = await prisma.conversation.findFirst({
      where: { id, OR: [{ userAId: me.id }, { userBId: me.id }] },
    });
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const items = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await requireUser();
    const id = params.id;
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });
    const conv = await prisma.conversation.findFirst({
      where: { id, OR: [{ userAId: me.id }, { userBId: me.id }] },
    });
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const msg = await prisma.message.create({
      data: { conversationId: id, senderId: me.id, text },
    });
    const io = getIO();
    io?.to(id).emit("message", msg);
    return NextResponse.json(msg);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}
