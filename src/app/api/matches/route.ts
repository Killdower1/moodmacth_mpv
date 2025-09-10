import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/server/prisma";

export async function GET() {
  const s = await getServerSession(authOptions);
  if (!s?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const me = String(s.user.id);
  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: me }, { userBId: me }] },
    include: { userA: true, userB: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const data = matches.map((m) => {
    const other = m.userAId === me ? m.userB : m.userA;
    return { id: m.id, otherId: other.id, otherName: other.name || other.email };
  });

  return NextResponse.json({ matches: data });
}
