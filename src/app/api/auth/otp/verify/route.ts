import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { read2fa, clear2fa, setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const twofa = read2fa();
  if (!twofa?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json().catch(()=>({}));
  if (!code) return NextResponse.json({ error: "Kode OTP wajib" }, { status: 400 });

  const now = new Date();
  const row = await prisma.otpCode.findFirst({
    where: { userId: twofa.uid, code, consumedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" }, select: { id: true }
  });
  if (!row) return NextResponse.json({ error: "Kode OTP salah / kadaluarsa" }, { status: 401 });

  await prisma.otpCode.update({ where: { id: row.id }, data: { consumedAt: now } });

  const user = await prisma.user.findUnique({
    where: { id: twofa.uid },
    select: { onboardingStep: true, phone: true }
  });

  clear2fa();
  const step = user?.onboardingStep ?? 0;
  setSessionCookie({ uid: twofa.uid, step });

  let next = "/mood";
  if (!user?.phone || step < 1) next = "/onboarding/1";
  else if (step < 2) next = "/onboarding/2";
  else if (step < 3) next = "/onboarding/3";

  return NextResponse.json({ ok: true, next });
}