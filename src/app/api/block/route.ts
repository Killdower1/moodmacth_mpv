import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const { targetId } = await req.json();
    if (!targetId) return NextResponse.json({ error: "targetId required" }, { status: 400 });
    await prisma.block.upsert({
      where: { byId_targetId: { byId: me.id, targetId } },
      update: {},
      create: { byId: me.id, targetId },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}
