import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmails } from "@/lib/admin";
import { toIntId } from "@/lib/id";

export async function POST(req: Request) {
  try {
    await requireAdminEmails();
    const fd = await req.formData();
    const raw = fd.get("userId");
    if (!raw) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    const userId = toIntId(raw);

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
