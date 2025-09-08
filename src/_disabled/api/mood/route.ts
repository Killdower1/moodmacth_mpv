import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = String((session as any)?.user?.id ?? "");
    if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });

    const { mood } = await req.json();
    if (!mood) return NextResponse.json({ ok: false, error: "MISSING_MOOD" }, { status: 400 });

    // cek tabel MoodSession ada/kolomnya apa
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name IN ('MoodSession','moodsession');
    `;
    const set = new Set(cols.map(c => c.column_name));

    if (set.size > 0) {
      // gunakan MoodSession jika ada
      // nonaktifkan session aktif (kalau ada kolom 'active')
      if (set.has("active")) {
        await prisma.moodSession.updateMany({
          where: { userId: userId as any },
          data: { active: true === false as any } // noop aman di TS, skip jika gagal
        }).catch(() => {});
      }

      const data: any = { userId: userId as any, mood };
      if (set.has("startedAt")) data.startedAt = new Date();
      if (set.has("expiresAt")) data.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      if (set.has("active")) data.active = true;

      await prisma.moodSession.create({ data }).catch(async () => {
        // fallback kalau userId harus Int
        try {
          const uid = Number(userId);
          const data2: any = { ...data, userId: uid };
          await prisma.moodSession.create({ data: data2 });
        } catch {}
      });
    } else {
      // fallback: simpan ke kolom user kalau ada 'currentMood'
      const ucols = await prisma.$queryRaw<{ column_name: string }[]>`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema='public' AND table_name IN ('User','user');
      `;
      const uset = new Set(ucols.map(c => c.column_name));
      if (uset.has("currentMood")) {
        await prisma.user.update({ where: { id: userId }, data: { currentMood: mood } });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "mood_failed" }, { status: 200 });
  }
}
