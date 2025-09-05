import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, gender: true, birthdate: true },
  });

  if (!user?.name || !user?.gender || !user?.birthdate) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-2">Feed</h1>
      <p className="opacity-70">Halo, {(session.user as any).id}</p>
      {/* TODO: taruh card swiper di sini nanti */}
    </div>
  );
}
