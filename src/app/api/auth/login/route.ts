import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { genOtp6, inMinutes, sendOtpDevLog } from "@/lib/otp";
import { set2faCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "email & password wajib" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: email }] },
      select: { id: true, passwordHash: true, phone: true }
    });
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Password salah" }, { status: 401 });

    // anti-spam: sama seperti resend
    const now = new Date();
    const halfMinAgo = new Date(now.getTime() - 30 * 1000);
    const tenMinAgo = new Date(now.getTime() - 10 * 60_000);

    const last = await prisma.otpCode.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true }
    });
    if (last && last.createdAt > halfMinAgo) {
      return NextResponse.json({ error: "Terlalu sering. Coba lagi dalam 30 detik." }, { status: 429 });
    }

    const cnt = await prisma.otpCode.count({
      where: { userId: user.id, createdAt: { gt: tenMinAgo } }
    });
    if (cnt >= 5) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const code = genOtp6();
    const expiresAt = inMinutes(5);
    await prisma.otpCode.create({ data: { userId: user.id, code, channel: "wa", expiresAt } });

    set2faCookie({ uid: user.id, exp: expiresAt.getTime() });
    await sendOtpDevLog(user.phone ?? null, code, "wa");

    const dev = process.env.NODE_ENV !== "production";
    return NextResponse.json({ ok: true, next: "/verify-otp", ...(dev ? { devCode: code } : {}) }, { status: 200 });
  } catch (e) {
    console.error("LOGIN_ERR", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}