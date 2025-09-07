import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { toIntId } from "@/lib/id";

export default async function MatchPage() {
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
    const lastMessage = c.messages[0]?.text || "";
    return { id: c.id, peer: { id: peer.id, name: peer.name, photo }, lastMessage };
  });
  return (
    <div className="p-4 space-y-4">
      {items.map(i => (
        <Link key={i.id} href={`/chat/${i.id}`} className="block border border-white/10 rounded p-4 bg-white/5">
          <div className="font-semibold">{i.peer.name}</div>
          {i.lastMessage && <div className="text-sm text-white/60 truncate">{i.lastMessage}</div>}
        </Link>
      ))}
      {!items.length && <div>No matches yet</div>}
    </div>
  );
}
