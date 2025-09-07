import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Mood } from "@prisma/client";
import { toIntId } from "@/lib/id";

export async function PATCH(req: Request) {
  try {
    const me = await requireUser();
    const meId = toIntId(me.id);
    const { mood } = await req.json();
    if (!mood || !(Object.values(Mood) as string[]).includes(mood)) {
      return NextResponse.json({ error: "Bad mood" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: meId },
      data: { currentMood: mood as Mood },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}
