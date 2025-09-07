
import { requireUser } from "@/lib/auth";
import { prisma } from "@/server/prisma";
import { toIntId } from "@/lib/id";

export async function GET() {
  const me = await requireUser();
  const meId = toIntId(me.id);

  const convs = await prisma.conversation.findMany({
    where: { OR: [{ userAId: meId }, { userBId: meId }] },
    orderBy: { createdAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      userA: { select: { id: true, name: true, photos: true } },
      userB: { select: { id: true, name: true, photos: true } },
    },
  });

  const items = convs.map((c) => {
    const peer = c.userAId === meId ? c.userB : c.userA;
    const peerPhoto =
      (peer as any).photos?.find?.((p: any) => p.isPrimary)?.url ||
      (peer as any).photos?.[0]?.url ||
      "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/1.jpg";

    return {
      id: c.id,
      peer: { id: (peer as any).id, name: (peer as any).name, photo: peerPhoto },
      lastMessage: c.messages[0]?.text || "",
      lastAt: c.messages[0]?.createdAt || c.createdAt,
    };
  });

  return new Response(JSON.stringify({ items }), { headers: { "Content-Type": "application/json" } });
}
