import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import bcrypt from "bcrypt";

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

async function seedIfFew() {
  if (process.env.NODE_ENV === "production") return;
  const total = await prisma.user.count().catch(() => 0);
  if (total >= 20) return;

  const cols = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name IN ('User','user');
  `;
  const set = new Set(cols.map(c => c.column_name));

  const NAMES = [
    "Ava","Noah","Mia","Liam","Zoe","Ethan","Isla","Mason",
    "Chloe","Lucas","Layla","Elijah","Aria","James","Nora","Benjamin",
    "Sofia","Henry","Mila","Alexander","Ella","Daniel","Grace","Jack"
  ];
  const pass = "demo12345";
  const hash = await bcrypt.hash(pass, 10);

  const rows: any[] = [];
  NAMES.forEach((name, i) => {
    const email = `${name.toLowerCase()}${i}@demo.local`;
    const avatar = `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(name)}`;
    const d: any = { email, passwordHash: hash };
    if (set.has("name")) d.name = name;
    if (set.has("gender")) d.gender = i % 2 === 0 ? "female" : "male";
    if (set.has("birthdate")) {
      const year = 1993 + (i % 8);
      d.birthdate = new Date(`${year}-0${(i % 9) + 1}-0${(i % 9) + 1}`);
    }
    if (set.has("avatarUrl")) d.avatarUrl = avatar;
    rows.push(d);
  });

  try {
    await prisma.user.createMany({ data: rows, skipDuplicates: true });
  } catch {
    for (const d of rows) {
      await prisma.user.upsert({ where: { email: d.email }, create: d, update: {} });
    }
  }
}

export async function GET() {
  try {
    await seedIfFew();

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
    if (set.has("email")) select.email = true;

    // Ambil 24 user apa adanya (tanpa exclude diri untuk demo supaya nggak kosong)
    const list = await prisma.user.findMany({
      take: 24,
      select,
      orderBy: set.has("createdAt") ? { createdAt: "desc" as const } : undefined,
    });

    const profiles = list.map((u: any) => {
      const name = u.name || (u.email ? String(u.email).split("@")[0] : "User");
      const age = set.has("birthdate") ? calcAge(u.birthdate) : null;
      const avatar =
        (set.has("avatarUrl") && u.avatarUrl)
          ? String(u.avatarUrl)
          : `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(name)}`;
      return { id: String(u.id), name, age, avatarUrl: avatar };
    });

    return NextResponse.json({ ok: true, profiles }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "feed_failed", profiles: [] }, { status: 200 });
  }
}
