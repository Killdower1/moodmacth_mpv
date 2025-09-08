import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/prisma";
import { attachSessionCookie, buildSessionToken } from "@/lib/session-cookie";
import { randomBytes } from "crypto";

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "register" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const emailRaw = String(body?.email ?? "").trim().toLowerCase();
    const name = body?.name ?? (emailRaw.split("@")[0] || "User");
    const passwordInput = typeof body?.password === "string" ? body.password : "";

    if (!emailRaw) {
      return NextResponse.json({ error: "Email wajib" }, { status: 400 });
    }

    const existed = await prisma.user.findUnique({ where: { email: emailRaw } });
    if (existed) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    // Pastikan SELALU ada passwordHash: pakai input user (>=6 char) atau random string
    const rawPwd = passwordInput.length >= 6 ? passwordInput : randomBytes(12).toString("hex");
    const passwordHash = await bcrypt.hash(rawPwd, 10);

    const user = await prisma.user.create({
      data: { email: emailRaw, name, passwordHash },
      select: { id: true, email: true, name: true },
    });

    // Set session cookie + auto login + arahkan ke onboarding
    const token = buildSessionToken(String(user.id));

    const accept = req.headers.get("accept") ?? "";
    if (accept.includes("text/html")) {
      const res = NextResponse.redirect(new URL("/onboarding", req.url), { status: 303 });
      attachSessionCookie(res, token);
      return res;
    }

    const res = NextResponse.json({ ok: true, user, next: "/onboarding" }, { status: 201 });
    attachSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error("REGISTER_ERR", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}