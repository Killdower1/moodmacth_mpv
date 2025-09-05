import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request){
  const session = await getServerSession(authOptions);
  if(!session?.user?.email) return NextResponse.json({error:'Unauthorized'},{status:401});
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if(!me) return NextResponse.json({error:'No user'},{status:400});

  const body = await req.json();
  const { mood='CHILL', intent='CHAT', boundaries={ topics_ok:true, media_ok:false, vc_first:false, meetup_after_minutes:30 } } = body || {};
  const expiresAt = new Date(Date.now()+24*60*60*1000);
  const ms = await prisma.moodSession.create({ data: { userId: me.id, mood, intent, boundaries, expiresAt, active: true } });
  return NextResponse.json({ ok:true, session: ms });
}
