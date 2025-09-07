import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { requireUser } from "@/lib/auth";
import { toIntId } from "@/lib/id";

export async function PATCH(req: Request) {
  try {
    const me = await requireUser();
    const meId = toIntId(me.id);
    const { gender, birthYear, photo } = await req.json();
    const birthdate = birthYear ? new Date(Number(birthYear), 0, 1) : undefined;
    await prisma.user.update({
      where: { id: meId },
      data: {
        gender: gender || undefined,
        birthdate,
        photos: photo
          ? {
              create: { url: photo, isPrimary: true }}
          : undefined}});
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "ERR" }, { status: 500 });
  }
}




