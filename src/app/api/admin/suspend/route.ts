import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { requireAdminEmails } from "@/lib/admin";
import { toIntId } from "@/lib/id";

export async function POST(req: Request) {
  try {
    await requireAdminEmails();
    const fd = await req.formData();
    const raw = fd.get("userId");
    if (!raw) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    const userId = toIntId(raw);

    await prisma.profile.deleteMany({ where: { userId } });

    return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 });
  }
}

