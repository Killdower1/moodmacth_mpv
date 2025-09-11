import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";
import { safeSlug } from "@/lib/slug";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set(["image/jpeg","image/png","image/webp"]);
const MAX_PHOTOS = 6;

function inferMimeFromName(name: string) {
  const ext = (name?.split(".").pop() || "").toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "";
}

export async function POST(req: Request) {
  const sess = readSession();
  if (!sess?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const current = await prisma.photo.count({ where: { userId: sess.uid } });
  if (current >= MAX_PHOTOS) {
    return NextResponse.json({ error: `Maksimal ${MAX_PHOTOS} foto` }, { status: 400 });
  }

  const form = await req.formData();
  // Node tidak punya global "File", jadi jangan pakai "instanceof File"
  const incoming = form.getAll("file") as any[];
  const items = incoming.filter(x =>
    x && typeof x.arrayBuffer === "function" && typeof x.name === "string"
  );

  if (!items.length) return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });

  const slots = Math.max(0, MAX_PHOTOS - current);
  const toSave = items.slice(0, slots);

  const saved: { id: string; url: string; isPrimary: boolean }[] = [];
  const baseDir = path.join(process.cwd(), "public", "uploads", sess.uid);
  await fs.mkdir(baseDir, { recursive: true });

  for (const it of toSave) {
    const mime = it.type || inferMimeFromName(it.name);
    if (!ALLOWED.has(mime)) continue;

    const ab = await it.arrayBuffer();
    if (ab.byteLength > MAX_SIZE) continue;

    const buf = Buffer.from(ab);
    const ext = (it.name.split(".").pop() || "jpg").toLowerCase();
    const nameCore = `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safeSlug(it.name)}`.replace(/\.+$/,"");
    const filename = `${nameCore}.${ext}`;
    const filepath = path.join(baseDir, filename);
    await fs.writeFile(filepath, buf);

    const url = `/uploads/${sess.uid}/${filename}`;
    const p = await prisma.photo.create({
      data: { userId: sess.uid, url, isPrimary: false },
      select: { id: true, url: true, isPrimary: true }
    });
    saved.push(p);
  }

  if (!saved.length) {
    return NextResponse.json({ error: "Semua file ditolak (format/ukuran/limit)" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, photos: saved });
}