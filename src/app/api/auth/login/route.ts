import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/prisma";
import { buildSessionToken, attachSessionCookie } from "@/lib/session-cookie";

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "login" });
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email & password wajib" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Email / password salah" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Email / password salah" }, { status: 401 });
    }

    const token = buildSessionToken(String(user.id));
    const res = NextResponse.json({ ok: true, next: "/onboarding", user: { id: user.id, email: user.email, name: user.name } });
    attachSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error("LOGIN_ERR", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}