import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getIO } from "@/lib/socket";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = 'force-dynamic';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get('matchId') || '';
  if(!matchId) return NextResponse.json({error:'Missing matchId'},{status:400});
  const messages = await prisma.message.findMany({ where: { matchId }, orderBy: { createdAt: 'asc' }, take: 100 });
  return NextResponse.json({ items: messages });
}

export async function POST(req: Request){
  const session = await getServerSession(authOptions);
  if(!session?.user?.email) return NextResponse.json({error:'Unauthorized'},{status:401});
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if(!me) return NextResponse.json({error:'No user'},{status:400});

  // 10 pesan per menit per user
  await rateLimit(`msg:${me.id}`, 10, 60 * 1000);

  const form = await req.formData();
  const matchId = String(form.get('matchId') || '');
  const content = String(form.get('content') || '');
  if(!matchId || !content) return NextResponse.json({error:'Missing fields'},{status:400});

  const msg = await prisma.message.create({ data: { matchId, fromUser: me.id, type:'TEXT', content } });
  await prisma.match.update({ where: { id: matchId }, data: { lastActiveAt: new Date() } });

  const io = getIO();
  if (io) {
    io.to(`match:${matchId}`).emit('message', { id: msg.id, fromUser: msg.fromUser, content: msg.content, createdAt: msg.createdAt });
  }

  return NextResponse.redirect(new URL(`/chat/${matchId}`, req.url), { status: 303 });
}
