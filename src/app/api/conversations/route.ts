import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toIntId } from "@/lib/id";

export async function GET() {
  try {
    const me = await requireUser();
    const meId = toIntId(me.id);
    const convs = await prisma.conversation.findMany({
      where: { OR: [{ userAId: meId }, { userBId: meId }] },
      orderBy: { createdAt: "desc" },
      include: {
        userA: { select: { id: true, name: true, photos: { where: { isPrimary: true }, take: 1 } } },
        userB: { select: { id: true, name: true, photos: { where: { isPrimary: true }, take: 1 } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    const items = convs.map(c => {
      const peer = c.userAId === meId ? c.userB : c.userA;
      const photo = peer.photos[0]?.url || "";
      const lastMessage = c.messages[0] || null;
      return { id: c.id, peer: { id: peer.id, name: peer.name, photo }, lastMessage };
    });
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}
