import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const LikeSchema = z.object({
  toId: z.string().min(1),
});

export async function POST(req: NextRequest){
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const body = await req.json();
  const parse = LikeSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { toId } = parse.data;
  if (toId === userId) return NextResponse.json({ error: 'Cannot like yourself' }, { status: 400 });

  // Create Like if not exists
  await prisma.like.upsert({
    where: { fromId_toId: { fromId: userId, toId } },
    update: {},
    create: { fromId: userId, toId },
  });

  // Check for mutual like
  const mutual = await prisma.like.findUnique({
    where: { fromId_toId: { fromId: toId, toId: userId } },
  });

  let matched = false;
  if (mutual) {
    // Ensure aId < bId for unique
    const [aId, bId] = [userId, toId].sort();
    await prisma.match.upsert({
      where: { aId_bId: { aId, bId } },
      update: {},
      create: { aId, bId },
    });
    matched = true;
  }

  return NextResponse.json({ ok: true, matched });
}
