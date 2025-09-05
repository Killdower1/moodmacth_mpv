import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(){
  const session = await getServerSession(authOptions);
  if(!session?.user?.email) return NextResponse.json({error:'Unauthorized'},{status:401});
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if(!me) return NextResponse.json({error:'No user'},{status:400});
  await prisma.moodSession.updateMany({ where: { userId: me.id, active: true }, data: { active: false } });
  return NextResponse.json({ ok:true });
}
