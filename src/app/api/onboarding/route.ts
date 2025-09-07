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

    const { name, birthdate, gender } = await req.json();
    const results: Array<{field:string; ok:boolean}> = [];
    const ops: Promise<any>[] = [];

    if (typeof name === "string" && name.trim()) {
      ops.push(
        prisma.user.update({ where: { id: userId }, data: { name: name.trim() } })
          .then(()=>results.push({field:"name", ok:true}))
          .catch(()=>results.push({field:"name", ok:false}))
      );
    }

    if (typeof birthdate === "string" && birthdate) {
      const d = new Date(birthdate);
      if (!Number.isNaN(d.getTime())) {
        ops.push(
          prisma.user.update({ where: { id: userId }, data: { birthdate: d } })
            .then(()=>results.push({field:"birthdate", ok:true}))
            .catch(()=>results.push({field:"birthdate", ok:false}))
        );
      }
    }

    if (typeof gender === "string" && gender) {
      ops.push(
        prisma.user.update({ where: { id: userId }, data: { gender } })
          .then(()=>results.push({field:"gender", ok:true}))
          .catch(()=>results.push({field:"gender", ok:false}))
      );
    }

    await Promise.all(ops).catch(()=>{ /* swallow */ });

    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (e: any) {
    // jangan 500; balikin info error ringan biar UI tetap lanjut
    return NextResponse.json({ ok: false, error: e?.message ?? "onboarding_failed" }, { status: 200 });
  }
}
