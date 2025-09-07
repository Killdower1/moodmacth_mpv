import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { requireUser } from "@/lib/auth";
import { toIntId } from "@/lib/id";

export async function GET() {
  try {
    const me = await requireUser();
    const meId = toIntId(me.id);
    const items = await prisma.notification.findMany({
      where: { userId: meId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}

