import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/server/prisma";

export const dynamic = "force-dynamic";

const NAMES = [
  "Ava", "Noah", "Mia", "Liam", "Zoe", "Ethan", "Isla", "Mason",
  "Chloe", "Lucas", "Layla", "Elijah", "Aria", "James", "Nora", "Benjamin",
  "Sofia", "Henry", "Mila", "Alexander", "Ella", "Daniel", "Grace", "Jack"
];

export async function GET() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok:false, error:"FORBIDDEN" }, { status: 403 });
    }

    // cek kolom yang ada di tabel User
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name IN ('User','user');
    `;
    const set = new Set(cols.map(c => c.column_name));

    const pass = "demo12345";
    const hash = await bcrypt.hash(pass, 10); // passwordHash bertipe String

    // siapkan data rows dinamis sesuai kolom yang ada
    const rows: any[] = [];
    NAMES.forEach((name, i) => {
      const email = `${name.toLowerCase()}${i}@demo.local`;
      const avatar = `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(name)}`;
      const d: any = {
        // kolom wajib:
        email,
        passwordHash: hash,
      };
      if (set.has("name")) d.name = name;
      if (set.has("gender")) d.gender = i % 2 === 0 ? "female" : "male";
      if (set.has("birthdate")) {
        const year = 1993 + (i % 8); // 1993..2000
        d.birthdate = new Date(`${year}-0${(i % 9) + 1}-0${(i % 9) + 1}`);
      }
      if (set.has("avatarUrl")) d.avatarUrl = avatar;
      rows.push(d);
    });

    // gunakan createMany skipDuplicates kalau email unique
    let inserted = 0;
    try {
      const result = await prisma.user.createMany({ data: rows, skipDuplicates: true });
      inserted = (result as any)?.count ?? 0;
    } catch {
      // fallback: upsert per user (kalau createMany terbatas)
      for (const d of rows) {
        await prisma.user.upsert({
          where: { email: d.email },
          create: d,
          update: {},
        });
      }
      inserted = -1; // unknown (semua ada/terbuat)
    }

    return NextResponse.json({ ok:true, inserted, password: pass }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e?.message ?? "seed_failed" }, { status: 200 });
  }
}
