import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type AnyClient = Record<string, any>;
function hasModel(c: AnyClient, name: string) {
  return !!(c?.[name] && typeof c[name].findMany === "function");
}

export async function GET() {
  try {
    const c = prisma as AnyClient;

    const hasUser         = hasModel(c, "user");
    const hasProfilePhoto = hasModel(c, "profilePhoto");
    const hasUserProfile  = hasModel(c, "userProfile");

    if (!hasUser) {
      console.warn("[/api/mood] WARN: model `user` tidak tersedia di Prisma Client. Cek migrate/generate & schema.");
      // Tanpa model user, kita nggak bisa ambil daftar email → balikin kosong supaya UI nggak crash
      return NextResponse.json({ profiles: [] });
    }

    const users = await c.user.findMany({ take: 50 });
    const emails = (users.map((u: any) => u.email).filter(Boolean) as string[]) || [];

    let photos: any[] = [];
    let profiles: any[] = [];

    if (emails.length && hasProfilePhoto) {
      photos = await c.profilePhoto.findMany({
        where: { email: { in: emails }, isPrimary: true },
      });
    } else if (!hasProfilePhoto) {
      console.warn("[/api/mood] WARN: model `ProfilePhoto` tidak tersedia. Lewati foto primary (pakai avatar fallback).");
    }

    if (emails.length && hasUserProfile) {
      profiles = await c.userProfile.findMany({
        where: { email: { in: emails } },
      });
    } else if (!hasUserProfile) {
      console.warn("[/api/mood] WARN: model `UserProfile` tidak tersedia. Lewati profil detail (pakai name/email).");
    }

    const photoMap = new Map(photos.map((p: any) => [p.email, p.url]));
    const profileMap = new Map(profiles.map((p: any) => [p.email, p]));

    const out = users.map((u: any, i: number) => {
      const url =
        (u.email && photoMap.get(u.email)) ||
        u.avatarUrl ||
        "/avatar-default.svg";
      const label =
        (u.email && profileMap.get(u.email)?.name) ||
        u.name ||
        u.email ||
        "User";
      return { id: i + 1, name: String(label), img: String(url) };
    });

    return NextResponse.json({ profiles: out });
  } catch (e: any) {
    console.error("[/api/mood] ERROR:", e?.code, e?.message);
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      isDev ? { error: "INTERNAL", message: e?.message } : { error: "INTERNAL" },
      { status: 500 }
    );
  }
}
