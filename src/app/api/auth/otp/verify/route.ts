import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { buildSessionToken, attachSessionCookie } from "@/lib/session-cookie";

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ error: "Email & OTP wajib" }, { status: 400 });

  // DEV OTP
  if (otp !== "123456") return NextResponse.json({ error: "OTP salah" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
    select: { id: true, email: true, name: true },
  });
  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  const token = buildSessionToken(String(user.id));
  const res = NextResponse.json({ ok: true, user, next: "/onboarding" });
  attachSessionCookie(res, token);
  return res;
}