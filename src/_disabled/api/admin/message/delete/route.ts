import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { requireAdminEmails } from "@/lib/admin";
import { toIntId } from "@/lib/id";

export async function POST(req: Request) {
  try {
    await requireAdminEmails();
    const fd = await req.formData();
    const raw = fd.get("messageId");
    if (!raw) return NextResponse.json({ error: "Missing messageId" }, { status: 400 });
    const messageId = toIntId(raw);

    await prisma.message.delete({ where: { id: messageId } });

    return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 });
  }
}



