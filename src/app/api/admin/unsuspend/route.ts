import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmails } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    await requireAdminEmails();
    const fd = await req.formData();
    const userId = Number(fd.get("userId"));
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const placeholder = `https://picsum.photos/seed/${String(userId).slice(0,6)}/400/600`;
    await prisma.profile.upsert({
      where: { userId },
      update: { photos: [placeholder], bio: "Reactivated by admin", lat: -6.2, lon: 106.8, interests: [] },
      create: { userId, photos: [placeholder], bio: "Reactivated by admin", lat: -6.2, lon: 106.8, interests: [] }
    });

    return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 });
  }
}
