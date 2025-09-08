import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { requireSession } from "@/lib/session";

export async function GET(req: Request) {
  // auth (aman kalau belum login -> [])
  const session = await requireSession().catch(() => null);
  if (!session?.user?.id) return NextResponse.json([]);

  const me = String(session.user.id);
  const url = new URL(req.url);
  const mood   = url.searchParams.get("mood") || undefined;
  const gender = url.searchParams.get("gender") || "any";
  const ageMin = Number(url.searchParams.get("ageMin") ?? 18);
  const ageMax = Number(url.searchParams.get("ageMax") ?? 35);

  // hitung batas umur (secara kasar: tahun)
  const now = Date.now();
  const msYear = 31557600000; // 365.25d
  const minBirth = new Date(now - ageMax * msYear);
  const maxBirth = new Date(now - ageMin * msYear);

  try {
    // Exclude: diri sendiri + (jika ada) yang sudah dilike/match (best effort - aman bila model tak ada)
    const anyPrisma: any = prisma as any;

    const liked = (await anyPrisma?.like?.findMany?.({
      where: { fromId: me }, select: { toId: true }
    })) ?? [];
    const likedIds = liked.map((x: any) => x.toId);

    const matched = (await anyPrisma?.match?.findMany?.({
      where: { OR: [{ aId: me }, { bId: me }] }, select: { aId: true, bId: true }
    })) ?? [];
    const matchedIds = matched.map((m: any) => (m.aId === me ? m.bId : m.aId));

    const users = await anyPrisma.user.findMany({
      where: {
        id: { notIn: [me, ...likedIds, ...matchedIds] },
        ...(gender !== "any" ? { gender } : {}),
        // birthdate bisa null di beberapa user; filter hanya jika ada
        ...(ageMin || ageMax ? { birthdate: { gte: minBirth, lte: maxBirth } } : {}),
        ...(mood ? {
          moodSessions: { some: { mood, endedAt: null } }
        } : {})
      },
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, birthdate: true, gender: true,
        photos: { orderBy: { order: "asc" }, take: 1, select: { url: true } }
      }
    });

    const data = users.map((u: any) => ({
      id: u.id,
      name: u.name ?? "User",
      age: u.birthdate ? Math.floor((Date.now() - +new Date(u.birthdate)) / msYear) : null,
      photo: u.photos?.[0]?.url ?? `https://i.pravatar.cc/512?u=${u.id}`,
      gender: u.gender ?? null
    }));

    return NextResponse.json(data);
  } catch {
    // kalau schema belum lengkap -> jangan bikin build fail
    return NextResponse.json([]);
  }
}