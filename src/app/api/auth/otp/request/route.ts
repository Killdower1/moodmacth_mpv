import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { read2fa, set2faCookie } from "@/lib/session";
import { genOtp6, inMinutes, sendOtpDevLog } from "@/lib/otp";

export async function POST() {
  const twofa = read2fa();
  if (!twofa?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = twofa.uid;
  const now = new Date();
  const tenMinAgo = new Date(now.getTime() - 10 * 60_000);
  const halfMinAgo = new Date(now.getTime() - 30 * 1000);

  // Cooldown: 30s
  const last = await prisma.otpCode.findFirst({
    where: { userId: uid },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true }
  });
  if (last && last.createdAt > halfMinAgo) {
    return NextResponse.json({ error: "Terlalu sering. Coba lagi dalam 30 detik." }, { status: 429 });
  }

  // Rate limit: 5x/10m
  const cnt = await prisma.otpCode.count({
    where: { userId: uid, createdAt: { gt: tenMinAgo } }
  });
  if (cnt >= 5) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  const code = genOtp6();
  const expiresAt = inMinutes(5);
  await prisma.otpCode.create({ data: { userId: uid, code, channel: "wa", expiresAt } });

  set2faCookie({ uid, exp: expiresAt.getTime() });
  const user = await prisma.user.findUnique({ where: { id: uid }, select: { phone: true } });
  await sendOtpDevLog(user?.phone ?? null, code, "wa");

  const dev = process.env.NODE_ENV !== "production";
  return NextResponse.json({ ok: true, ...(dev ? { devCode: code } : {}) });
}