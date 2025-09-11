import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const sess = readSession();
  if (!sess?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { photoId } = await req.json();
  if (!photoId) return NextResponse.json({ error: "photoId wajib" }, { status: 400 });

  const owned = await prisma.photo.findFirst({ where: { id: photoId, userId: sess.uid }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });

  await prisma.$transaction([
    prisma.photo.updateMany({ where: { userId: sess.uid, isPrimary: true }, data: { isPrimary: false } }),
    prisma.photo.update({ where: { id: photoId }, data: { isPrimary: true } }),
  ]);

  return NextResponse.json({ ok: true });
}