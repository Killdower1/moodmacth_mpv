import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

function parseBase64(dataUrl: string) {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || "");
  if (!m) return null;
  const [, mime, b64] = m;
  const ext = (mime.split("/")[1] || "png").toLowerCase();
  return { buffer: Buffer.from(b64, "base64"), ext };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const account = body?.account || {};
    const ob1 = body?.ob1 || {};
    const ob2 = body?.ob2 || {};

    const emailRaw = String(account.email || "").trim().toLowerCase();
    const password = String(account.password || "");
    if (!emailRaw || !password || password.length < 6) {
      return NextResponse.json({ ok: false, error: "INVALID_ACCOUNT" }, { status: 400 });
    }
    const exists = await prisma.user.findUnique({ where: { email: emailRaw } });
    if (exists) return NextResponse.json({ ok: false, error: "EMAIL_EXISTS" }, { status: 409 });

    const user = await prisma.user.create({ data: { email: emailRaw, name: ob1?.name ?? null }, select: { id: true, email: true } });
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.authLocal.upsert({ where: { email: emailRaw }, update: { passwordHash }, create: { email: emailRaw, passwordHash } });

    let dateOfBirth: Date | null = null;
    if (ob1?.dob) { const d=new Date(ob1.dob); if (!Number.isNaN(d.getTime())) dateOfBirth = d; }
    await prisma.userProfile.upsert({
      where: { email: emailRaw },
      update: { name: ob1?.name ?? undefined, dateOfBirth: dateOfBirth ?? undefined, gender: ob1?.gender ?? undefined, bio: ob1?.bio ?? undefined },
      create: { email: emailRaw, name: ob1?.name ?? null, dateOfBirth, gender: ob1?.gender ?? null, bio: ob1?.bio ?? null }
    });

    // photos
    const files: string[] = Array.isArray(ob2?.files) ? ob2.files : [];
    const primaryIndex: number = Number.isInteger(ob2?.primaryIndex) ? ob2.primaryIndex : 0;
    await prisma.profilePhoto.deleteMany({ where: { email: emailRaw } });

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const savedUrls: string[] = [];
    for (let i=0;i<files.length;i++){
      const parsed = parseBase64(files[i]); if (!parsed) continue;
      const filename = crypto.randomUUID()+"."+parsed.ext;
      await writeFile(path.join(uploadDir, filename), parsed.buffer);
      const url = "/uploads/"+filename;
      savedUrls.push(url);
      await prisma.profilePhoto.create({ data: { email: emailRaw, url, isPrimary: false } });
    }
    if (savedUrls.length){
      const pick = Math.min(Math.max(primaryIndex,0), savedUrls.length-1);
      await prisma.profilePhoto.updateMany({ where: { email: emailRaw, url: savedUrls[pick] }, data: { isPrimary: true } });
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e) {
    console.error("[register-with-onboarding] error:", e);
    return NextResponse.json({ ok: false, error: "INTERNAL" }, { status: 500 });
  }
}
