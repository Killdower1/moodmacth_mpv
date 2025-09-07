import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/prisma';
import { z } from 'zod';
import { toIntId } from '@/lib/id';

const LikeSchema = z.object({
  toId: z.number()});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = toIntId(session.user.id);
  const body = await req.json();
  const parse = LikeSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const toId = toIntId(parse.data.toId);
  if (toId === userId) return NextResponse.json({ error: 'Cannot like yourself' }, { status: 400 });

  await prisma.like.create({
    data: { fromUser: userId, toUser: toId, moodCtx: '' }}).catch(() => {});

  const mutual = await prisma.like.findFirst({
    where: { fromUser: toId, toUser: userId }});

  let matched = false;
  if (mutual) {
    const [userA, userB] = [userId, toId].sort((a,b) => a - b);
    await prisma.match.create({ data: { userA, userB } }).catch(() => {});
    matched = true;
  }

  return NextResponse.json({ ok: true, matched });
}



