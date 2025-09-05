import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ "users": [], "nextCursor": null }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const take = 10;

    // Get ids to exclude: self, liked, hidden
    const [likes, hiddens] = await Promise.all([
      prisma.like.findMany({ where: { fromId: userId }, select: { toId: true } }),
      prisma.hidden.findMany({ where: { userId }, select: { hideId: true } }),
    ]);
    const excludeIds = [userId, ...likes.map(l => l.toId), ...hiddens.map(h => h.hideId)];

    // Only show users with complete profile
    const users = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        name: { not: null },
        gender: { not: null },
        birthdate: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        name: true,
        image: true,
        birthdate: true,
        gender: true,
      },
    });

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        image: u.image,
        age: getAge(u.birthdate),
        gender: u.gender,
      })),
      nextCursor: users.length === take ? users[users.length - 1].id : null,
    });
  } catch (err) {
    return NextResponse.json({ "users": [], "nextCursor": null }, { status: 500 });
  }
}

function getAge(birthdate?: Date | null) {
  if (!birthdate) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birthdate.getFullYear();
  const m = now.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthdate.getDate())) age--;
  return age;
}

const fetchCards = async (cursor?: string) => {
  setLoading(true);
  const res = await fetch(`/api/feed${cursor ? `?cursor=${cursor}` : ""}`);
  if (!res.ok) {
    setLoading(false);
    return;
  }
  const text = await res.text();
  if (!text) {
    setLoading(false);
    return;
  }
  const data = JSON.parse(text);
  setCards((prev) => [...prev, ...data.users]);
  setNextCursor(data.nextCursor);
  setLoading(false);
};