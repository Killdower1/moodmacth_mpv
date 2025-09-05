import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(){
  const session = await getServerSession(authOptions);
  if(!session?.user?.email) return NextResponse.json({error:'Unauthorized'},{status:401});
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if(!me) return NextResponse.json({error:'No user'},{status:400});

  const profiles = await prisma.profile.findMany({
    where: { userId: { not: me.id } },
    take: 20,
    include: { user: true }
  });

  return NextResponse.json({ items: profiles });
}
