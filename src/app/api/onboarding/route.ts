import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = String((session as any)?.user?.id ?? "");
    if (!userId) {
      return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const body = await req.json();
    const name: unknown = body?.name;
    const birthdate: unknown = body?.birthdate;
    const gender: unknown = body?.gender;

    // Ambil daftar kolom yang ADA pada tabel User
    // (handle case-sensitive: 'User' & 'user')
    const columns = await prisma.$queryRaw<
      { column_name: string }[]
    >`SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('User','user');`;

    const colset = new Set(columns.map(c => c.column_name));

    // Bangun data update hanya dari kolom yang tersedia
    const data: Record<string, any> = {};
    if (colset.has("name") && typeof name === "string" && name.trim()) {
      data.name = name.trim();
    }
    if (colset.has("gender") && typeof gender === "string" && gender) {
      data.gender = gender;
    }
    if (colset.has("birthdate") && typeof birthdate === "string" && birthdate) {
      const d = new Date(birthdate);
      if (!Number.isNaN(d.getTime())) data.birthdate = d;
    }
    // JANGAN pernah set "age" di sini walau ada di schema lama

    // Kalau tidak ada apapun untuk diupdate, tetap OK
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: true, updated: [] }, { status: 200 });
    }

    await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json({ ok: true, updated: Object.keys(data) }, { status: 200 });
  } catch (e: any) {
    // Jangan pecahin flow, balikin 200 dengan flag ok:false supaya UI tetap lanjut
    return NextResponse.json({ ok: false, error: e?.message ?? "onboarding_failed" }, { status: 200 });
  }
}
