import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/server/prisma";

export async function GET() {
  const s = await getServerSession(authOptions);
  if (!s?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const profiles = await prisma.user.findMany({
    where: { id: { not: s.user.id as string } },
    take: 30,
    include: { profile: true },
  });

  return NextResponse.json({
    profiles: profiles.map((u) => ({
      id: u.id,
      name: u.name || u.email,
      photos: u.profile?.photos ?? [],
      mood: u.profile?.mood ?? null,
      isPremium: u.profile?.isPremium ?? false,
      bio: u.profile?.bio ?? "",
    })),
  });
}
