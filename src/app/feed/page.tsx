import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SwipeDeck from "@/components/SwipeDeck";
import { normalizeProfiles } from "@/lib/normalizeProfiles";
import type { Profile } from "@/components/ProfileCard";

function getAge(birthdate?: Date | null) {
  if (!birthdate) return 0;
  const now = new Date();
  let age = now.getFullYear() - birthdate.getFullYear();
  const m = now.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthdate.getDate())) age--;
  return age;
}

async function getProfiles(userId: number): Promise<Profile[]> {
  const [likes, hiddens] = await Promise.all([
    prisma.like.findMany({ where: { fromUser: userId }, select: { toUser: true } }),
    prisma.hidden.findMany({ where: { userId }, select: { hideId: true } }),
  ]);
  const excludeIds = [userId, ...likes.map((l) => l.toUser), ...hiddens.map((h) => h.hideId)];

  const users = await prisma.user.findMany({
    where: {
      id: { notIn: excludeIds },
      name: { not: null },
      gender: { not: null },
      birthdate: { not: null },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      birthdate: true,
      gender: true,
      profile: { select: { photos: true } },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name!,
    age: getAge(u.birthdate),
    gender: u.gender ?? undefined,
    photos: u.profile?.photos ?? [],
  }));
  return normalizeProfiles(rows);
}

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, gender: true, birthdate: true },
  });

  if (!user?.name || !user?.gender || !user?.birthdate) {
    redirect("/onboarding");
  }

  const profiles = await getProfiles(userId);

  return (
    <main className="min-h-screen bg-[#0b0f14]">
      <section className="px-4 pt-6 pb-10 flex justify-center">
        <SwipeDeck profiles={profiles} />
      </section>
    </main>
  );
}
