import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const fromId = String((session as any)?.user?.id ?? "");
    if (!fromId) return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });

    const { toUserId, direction } = await req.json();
    if (!toUserId || !["like","nope"].includes(direction)) {
      return NextResponse.json({ ok: false, error: "BAD_INPUT" }, { status: 400 });
    }

    // cek tabel Swipe ada?
    const hasSwipe = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_name IN ('Swipe','swipe');
    `;
    if (hasSwipe.length > 0) {
      // coba create swipe (userId bisa int/string; coba keduanya)
      const data: any = { fromId: fromId as any, toId: toUserId as any, direction };
      try { await prisma.swipe.create({ data }); }
      catch {
        try {
          const f = Number(fromId), t = Number(toUserId);
          await prisma.swipe.create({ data: { ...data, fromId: f, toId: t } as any });
        } catch {}
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "swipe_failed" }, { status: 200 });
  }
}
