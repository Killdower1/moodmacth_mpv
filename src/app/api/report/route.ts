import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "No user" }, { status: 400 });

  const fd = await req.formData();
  const reason = String(fd.get("reason") || "").trim();
  const messageId = (fd.get("messageId") ? String(fd.get("messageId")) : undefined);
  const targetUserId = (fd.get("targetUserId") ? String(fd.get("targetUserId")) : undefined);

  if (!reason) return NextResponse.json({ error: "Missing reason" }, { status: 400 });

  // 5 report per 10 menit per user
  await rateLimit(`report:${me.id}`, 5, 10 * 60 * 1000);

  await prisma.reportDetail.create({
    data: {
      fromUserId: me.id,
      targetUserId: targetUserId ? Number(targetUserId) : undefined,
      messageId,
      reason,
    },
  });

  return NextResponse.json({ ok: true });
}
