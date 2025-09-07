import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const me = await requireUser();
    const convs = await prisma.conversation.findMany({
      where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
      orderBy: { createdAt: "desc" },
      include: {
        userA: { select: { id: true, name: true, photos: { where: { isPrimary: true }, take: 1 } } },
        userB: { select: { id: true, name: true, photos: { where: { isPrimary: true }, take: 1 } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    const items = convs.map(c => {
      const peer = c.userAId === me.id ? c.userB : c.userA;
      const photo = peer.photos[0]?.url || "";
      const lastMessage = c.messages[0] || null;
      return { id: c.id, peer: { id: peer.id, name: peer.name, photo }, lastMessage };
    });
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}
