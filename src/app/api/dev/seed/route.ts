import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/prisma";

const NAMES = [
  "Ava","Noah","Mia","Liam","Zoe","Ethan","Isla","Mason",
  "Chloe","Lucas","Layla","Elijah","Aria","James","Nora","Benjamin",
  "Sofia","Henry","Mila","Alexander","Ella","Daniel","Grace","Jack"
];

export async function GET(req: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok:false, error:"FORBIDDEN" }, { status: 403 });
    }
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "1";

    // cek kolom yang ada
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name IN ('User','user');
    `;
    const set = new Set(cols.map(c => c.column_name));

    const total = await prisma.user.count().catch(() => 0);
    if (!force && total >= 20) {
      return NextResponse.json({ ok:true, inserted:0, note:"already >= 20 users" }, { status: 200 });
    }

    const hash = await bcrypt.hash("demo12345", 10);
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

    let inserted = 0;
    try {
      const r = await prisma.user.createMany({ data: rows, skipDuplicates: true });
      inserted = (r as any)?.count ?? 0;
    } catch {
      for (const d of rows) {
        await prisma.user.upsert({ where: { email: d.email }, create: d, update: {} });
      }
      inserted = -1;
    }

    return NextResponse.json({ ok:true, inserted, password:"demo12345" }, { status: 200 });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message ?? "seed_failed" }, { status: 200 });
  }
}
