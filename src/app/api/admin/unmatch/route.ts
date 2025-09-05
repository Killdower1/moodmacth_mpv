import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmails } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    await requireAdminEmails();
    const fd = await req.formData();
    const matchId = String(fd.get("matchId") || "");
    if (!matchId) return NextResponse.json({ error: "Missing matchId" }, { status: 400 });

    await prisma.message.deleteMany({ where: { matchId } });
    await prisma.match.delete({ where: { id: matchId } });

    return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 });
  }
}
