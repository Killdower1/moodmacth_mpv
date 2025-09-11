import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession, setSessionCookie } from "@/lib/session";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sess = readSession();
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const profileIndex = parseInt((form.get("profileIndex") as string) ?? "0", 10);

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  const saved: { id: string; url: string }[] = [];
  for (const f of files) {
    if (!f || typeof f.arrayBuffer !== "function") continue;
    const buf = Buffer.from(await f.arrayBuffer());
    const fileName = `${sess.uid}-${randomUUID()}-${f.name}`;
    await writeFile(path.join(uploadDir, fileName), buf);
    const photo = await prisma.photo.create({
      data: { userId: sess.uid, url: `/uploads/${fileName}`, isPrimary: false },
      select: { id: true, url: true },
    });
    saved.push(photo);
  }

  if (saved.length > 0) {
    const idx = Math.min(Math.max(profileIndex, 0), saved.length - 1);
    await prisma.photo.update({ where: { id: saved[idx].id }, data: { isPrimary: true } });
  }

  await prisma.user.update({ where: { id: sess.uid }, data: { onboardingStep: 2 } });
  setSessionCookie({ uid: sess.uid, step: 2 });

  return NextResponse.json({ ok: true, next: "/onboarding/3" });
}
