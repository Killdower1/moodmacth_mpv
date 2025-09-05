import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmails } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    await requireAdminEmails();
    const fd = await req.formData();
    const messageId = String(fd.get("messageId") || "");
    if (!messageId) return NextResponse.json({ error: "Missing messageId" }, { status: 400 });

    await prisma.message.delete({ where: { id: messageId } });

    return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 });
  }
}
