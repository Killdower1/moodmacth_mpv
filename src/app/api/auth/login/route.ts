import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { buildSessionToken, setSessionCookie } from "@/lib/session-cookie";

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "login" });
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email) return NextResponse.json({ error: "Email wajib" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (!user) return NextResponse.json({ error: "Email / password salah" }, { status: 401 });

    // Jika kamu punya passwordHash, cocokkan di sini. Kalau belum, lewati (OTP/dev flow).
    // const ok = await bcrypt.compare(password, user.passwordHash)
    // if (!ok) return NextResponse.json({ error: "Email / password salah" }, { status: 401 });

    const token = buildSessionToken(String((user as any).id));
    setSessionCookie(token); // <- tulis cookie

    const accept = req.headers.get("accept") ?? "";
    if (accept.includes("text/html")) {
      return NextResponse.redirect(new URL("/onboarding", req.url), { status: 303 });
    }
    return NextResponse.json({ ok: true, user: { id: (user as any).id, email: (user as any).email, name: (user as any).name }, next: "/onboarding" });
  } catch (err) {
    console.error("LOGIN_ERR", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}