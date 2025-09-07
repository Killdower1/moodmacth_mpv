import { prisma } from "@/server/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(){
  const session = await getServerSession(authOptions);
  if(!session?.user?.email) return NextResponse.json({error:'Unauthorized'},{status:401});
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if(!me) return NextResponse.json({error:'No user'},{status:400});

  const matches = await prisma.match.findMany({
    where: { OR: [ { userA: me.id }, { userB: me.id } ] },
    orderBy: { lastActiveAt: 'desc' }
  });
  return NextResponse.json({ items: matches });
}


