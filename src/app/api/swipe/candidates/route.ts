import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me) return NextResponse.json({ error: "No user" }, { status: 404 });

  const likedIds = (await prisma.like.findMany({ where: { fromId: me.id }, select: { toId: true } })).map(x=>x.toId);
  const candidates = await prisma.user.findMany({
    where: { id: { not: me.id, notIn: likedIds } },
    orderBy: { lastActiveAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ candidates });
}
