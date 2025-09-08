import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { setSessionCookie, buildSessionToken } from "@/lib/session-cookie";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email & OTP wajib" }, { status: 400 });
    }

    // DEV: validasi OTP dummy
    if (String(otp) !== "123456") {
      return NextResponse.json({ error: "Kode OTP salah" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
      select: { id: true, email: true, name: true },
    });
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    // set cookie sesi
    const token = buildSessionToken(String(user.id));
    setSessionCookie(token);

    const accept = req.headers.get("accept") ?? "";
    if (accept.includes("text/html")) {
      return NextResponse.redirect(new URL("/onboarding", req.url), { status: 303 });
    }
    return NextResponse.json({ ok: true, user, next: "/onboarding" });
  } catch (err) {
    console.error("OTP_VERIFY_ERR", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, hint: "POST email + otp" }, { status: 405 });
}