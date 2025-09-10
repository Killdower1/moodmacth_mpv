import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const users = await prisma.user.findMany({ take: 50 });
  const emails = users.map(u => u.email).filter(Boolean) as string[];
  const [photos, profiles] = await Promise.all([
    prisma.profilePhoto.findMany({ where: { email: { in: emails }, isPrimary: true } }),
    prisma.userProfile.findMany({ where: { email: { in: emails } } })
  ]);
  const photoMap = new Map(photos.map(p => [p.email, p.url]));
  const profileMap = new Map(profiles.map(p => [p.email, p]));
  const out = users.map((u,i) => {
    const url = photoMap.get(u.email!) || (u as any).avatarUrl || "/avatar-default.svg";
    const name = profileMap.get(u.email!)?.name || (u as any).name || u.email || "User";
    return { id: i+1, name: String(name), img: String(url) };
  });
  return NextResponse.json({ profiles: out });
}
