import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/prisma';
import { z } from 'zod';
import { toIntId } from '@/lib/id';

const DislikeSchema = z.object({
  toId: z.number(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = toIntId(session.user.id);
  const body = await req.json();
  const parse = DislikeSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const toId = toIntId(parse.data.toId);
  if (toId === userId) return NextResponse.json({ error: 'Cannot hide yourself' }, { status: 400 });

  await prisma.hidden.upsert({
    where: { userId_hideId: { userId, hideId: toId } },
    update: {},
    create: { userId, hideId: toId },
  });

  return NextResponse.json({ ok: true });
}