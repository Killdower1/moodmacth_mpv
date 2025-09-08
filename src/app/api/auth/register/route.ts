import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/prisma";
import { buildSessionToken, setSessionCookie } from "@/lib/session-cookie";

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "register" });
}

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email) return NextResponse.json({ error: "Email wajib" }, { status: 400 });

    const emailNorm = String(email).trim().toLowerCase();

    const existed = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (existed) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });

    // Jika ada password -> hash; kalau tidak ada, gunakan string kosong (schema butuh string non-null)
    const passwordHash = password ? await bcrypt.hash(String(password), 10) : "";

    const user = await prisma.user.create({
      data: {
        email: emailNorm,
        name: name ?? emailNorm.split("@")[0],
        passwordHash, // <-- WAJIB ada, walau boleh string kosong
      },
      select: { id: true, email: true, name: true },
    });

    // auto-login: set cookie sesi lalu redirect /onboarding (untuk HTML) atau JSON (untuk fetch)
    const token = buildSessionToken(String(user.id));
    setSessionCookie(token);

    const accept = req.headers.get("accept") ?? "";
    if (accept.includes("text/html")) {
      return NextResponse.redirect(new URL("/onboarding", req.url), { status: 303 });
    }
    return NextResponse.json({ ok: true, user, next: "/onboarding" }, { status: 201 });
  } catch (err) {
    console.error("REGISTER_ERR", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}