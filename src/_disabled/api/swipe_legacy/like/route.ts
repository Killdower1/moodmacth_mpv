import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toId } = await req.json();
  if (!toId) return NextResponse.json({ error: "Missing toId" }, { status: 400 });

  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me) return NextResponse.json({ error: "No user" }, { status: 404 });

  await prisma.like.upsert({ where: { fromId_toId: { fromId: me.id, toId } }, create: { fromId: me.id, toId }, update: {} });

  const back = await prisma.like.findUnique({ where: { fromId_toId: { fromId: toId, toId: me.id } } });
  if (back) {
    const exists = await prisma.match.findFirst({ where: { OR: [{ aId: me.id, bId: toId }, { aId: toId, bId: me.id }] } });
    if (!exists) { await prisma.match.create({ data: { aId: me.id, bId: toId } }); }
    return NextResponse.json({ matched: true });
  }
  return NextResponse.json({ matched: false });
}
