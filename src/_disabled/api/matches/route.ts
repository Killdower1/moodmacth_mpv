import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me) return NextResponse.json({ error: "No user" }, { status: 404 });

  const matches = await prisma.match.findMany({
    where: { OR: [{ aId: me.id }, { bId: me.id }] },
    orderBy: { lastActiveAt: "desc" },
    include: { a: true, b: true },
    take: 50,
  });
  return NextResponse.json({ matches });
}
