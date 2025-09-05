import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request){
  const session = await getServerSession(authOptions);
  if(!session?.user?.email) return NextResponse.json({error:'Unauthorized'},{status:401});
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if(!me) return NextResponse.json({error:'No user'},{status:400});

  const form = await req.formData();
  const toUser = String(form.get('toUser') || '');
  if(!toUser) return NextResponse.json({error:'Missing toUser'},{status:400});

  await prisma.like.create({ data: { fromUser: me.id, toUser, moodCtx: 'CHILL' } });

  const likedBack = await prisma.like.findFirst({ where: { fromUser: toUser, toUser: me.id } });
  if(likedBack){
    // create match if not exists
    const existing = await prisma.match.findFirst({
      where: { OR: [
        { userA: me.id, userB: toUser },
        { userA: toUser, userB: me.id }
      ]}
    });
    if(!existing){
      await prisma.match.create({ data: { userA: me.id, userB: toUser, adultCtx: false } });
    }
  }

    return NextResponse.redirect(new URL('/matches', req.url));
}
