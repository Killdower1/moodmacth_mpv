import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { genOtp6, inMinutes, sendOtpDevLog } from "@/lib/otp";

function read2faUid() {
  const c = cookies();
  const raw = c.get("mood_2fa")?.value || c.get("m2fa")?.value;
  if (!raw) return null;
  try {
    const secret = process.env.SESSION_SECRET || "dev-secret";
    const payload = jwt.verify(raw, secret) as any;
    return payload?.uid as string | null;
  } catch { return null; }
}

export async function POST(){
  const uid = read2faUid();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = genOtp6();
  const o = await prisma.otpCode.create({
    data: {
      userId: uid,
      code,
      channel: "wa",
      expiresAt: inMinutes(5)
    },
    select: { code: true }
  });

  // dev log (lihat di terminal)
  sendOtpDevLog({ to: "(no-phone)", channel: "wa", code: o.code });

  return NextResponse.json({ ok: true });
}