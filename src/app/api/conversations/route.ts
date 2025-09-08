import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session?.user?.id) return NextResponse.json([]);

  const me = String(session.user.id);
  const db: any = prisma as any;

  try {
    const convs = await db?.conversation?.findMany?.({
      where: { OR: [{ aId: me }, { bId: me }] },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, aId: true, bId: true, createdAt: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, createdAt: true, fromId: true, readAt: true } }
      }
    }) ?? [];

    const peerIds = convs.map((c: any) => (c.aId === me ? c.bId : c.aId));
    const peers = await db.user.findMany({
      where: { id: { in: peerIds } },
      select: { id: true, name: true, photos: { orderBy: { order: "asc" }, take: 1, select: { url: true } } }
    });
    const map = new Map(peers.map((p: any) => [p.id, p]));

    const data = convs.map((c: any) => {
      const pid = c.aId === me ? c.bId : c.aId;
      const p = map.get(pid);
      return {
        id: c.id,
        peer: { id: pid, name: p?.name ?? "User", photo: p?.photos?.[0]?.url ?? `https://i.pravatar.cc/128?u=${pid}` },
        lastMessage: c.messages?.[0]?.content ?? "Katakan hai ??",
        lastAt: c.messages?.[0]?.createdAt ?? c.createdAt
      };
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]); // aman kalau model belum ada
  }
}