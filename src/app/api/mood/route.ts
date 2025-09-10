import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.user.findMany({ take: 50 });
  const profiles = rows.map((u: any, i: number) => {
    const avatar = u?.avatarUrl && String(u.avatarUrl).trim() ? String(u.avatarUrl) : "/avatar-default.svg";
    const label = u?.name || u?.email || "User";
    return {
      id: i + 1,     // numerik agar cocok dengan UI swipe lama
      name: label,   // UI pakai `name`
      img: avatar,   // UI pakai `img`
    };
  });
  return NextResponse.json({ profiles });
}
