import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmails } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    await requireAdminEmails();
    const fd = await req.formData();
    const userId = Number(fd.get("userId"));
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    await prisma.profile.deleteMany({ where: { userId } });

    return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 });
  }
}
