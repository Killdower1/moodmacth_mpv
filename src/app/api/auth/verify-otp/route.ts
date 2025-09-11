import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Coba baca cookie 2FA (nama fallback)
function read2fa() {
  const c = cookies();
  const raw = c.get("mood_2fa")?.value || c.get("m2fa")?.value;
  if (!raw) return null;
  try {
    const secret = process.env.SESSION_SECRET || "dev-secret";
    const payload = jwt.verify(raw, secret) as any;
    return { uid: payload?.uid as string | undefined };
  } catch { return null; }
}
function clear2fa() {
  const c = cookies();
  c.set("mood_2fa", "", { maxAge: 0, path: "/" });
  c.set("m2fa", "", { maxAge: 0, path: "/" });
}

export async function POST(req: NextRequest){
  try{
    const a = read2fa();
    if (!a?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await req.json();
    if (!code || String(code).length !== 6) {
      return NextResponse.json({ error: "Kode OTP 6 digit" }, { status: 400 });
    }

    const now = new Date();
    const row = await prisma.otpCode.findFirst({
      where: {
        userId: a.uid, code: String(code),
        consumedAt: null, expiresAt: { gt: now }
      },
      orderBy: { createdAt: "desc" }
    });
    if (!row) return NextResponse.json({ error: "OTP salah atau expired" }, { status: 400 });

    await prisma.otpCode.update({ where: { id: row.id }, data: { consumedAt: now } });

    // sesi full
    setSessionCookie({ uid: a.uid, step: 2 }); // step bebas, nanti di-update lagi sesuai user
    clear2fa();

    return NextResponse.json({ ok:true, next:"/" });
  }catch(e){
    console.error("VERIFY_OTP_ERR", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}