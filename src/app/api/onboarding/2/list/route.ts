import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export async function GET() {
  const sess = readSession();
  if (!sess?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const photos = await prisma.photo.findMany({
    where: { userId: sess.uid },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    select: { id: true, url: true, isPrimary: true }
  });

  return NextResponse.json({ photos });
}