import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

function calcAge(b?: Date | string | null) {
  if (!b) return null;
  const d = new Date(b);
  if (Number.isNaN(d.getTime())) return null;
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  const m = n.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
  return a;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const me = String((session as any)?.user?.id ?? "");

    // Kolom yang tersedia di tabel User
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name IN ('User','user');
    `;
    const set = new Set(cols.map(c => c.column_name));

    const select: any = { id: true };
    if (set.has("name")) select.name = true;
    if (set.has("birthdate")) select.birthdate = true;
    if (set.has("gender")) select.gender = true;
    if (set.has("avatarUrl")) select.avatarUrl = true;

    // Ambil 20 user selain saya
    const list = await prisma.user.findMany({
      where: me ? { id: { not: me as any } } : undefined,
      take: 20,
      select,
      orderBy: set.has("createdAt") ? { createdAt: "desc" as const } : undefined,
    });

    const profiles = list.map((u: any) => {
      const name = u.name || (u.email ? String(u.email).split("@")[0] : "User");
      const age = set.has("birthdate") ? calcAge(u.birthdate) : null;
      const avatar =
        (set.has("avatarUrl") && u.avatarUrl) ?
          String(u.avatarUrl) :
          `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(name)}`;
      return { id: String(u.id), name, age, avatarUrl: avatar };
    });

    return NextResponse.json({ ok: true, profiles }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "feed_failed", profiles: [] }, { status: 200 });
  }
}
