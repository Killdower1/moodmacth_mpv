import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { requireUser } from "@/lib/auth";
import { toIntId } from "@/lib/id";

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const meId = toIntId(me.id);
    const { targetId: targetIdRaw, reason } = await req.json();
    if (!targetIdRaw) return NextResponse.json({ error: "targetId required" }, { status: 400 });
    const targetId = toIntId(targetIdRaw);
    await prisma.report.create({ data: { byId: meId, targetId, reason } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}



