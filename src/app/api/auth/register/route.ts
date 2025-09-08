import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/server/prisma";
import { buildSessionToken, attachSessionCookie } from "@/lib/session-cookie";

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "register" });
}

export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type")?.toLowerCase() ?? "";
    const accept = req.headers.get("accept")?.toLowerCase() ?? "";
    const isForm = ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data");
    const wantsHtml = accept.includes("text/html") || isForm;

    const body = isForm ? Object.fromEntries(await (await req.formData()).entries()) : await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const name  = String(body.name ?? "").trim() || email.split("@")[0];
    const password = String(body.password ?? "");

    if (!email) {
      const msg = "Email wajib";
      if (wantsHtml) return NextResponse.redirect(new URL("/register?error=" + encodeURIComponent(msg), req.url));
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const existed = await prisma.user.findUnique({ where: { email } });
    if (existed) {
      const msg = "Email sudah terdaftar";
      if (wantsHtml) return NextResponse.redirect(new URL("/register?error=" + encodeURIComponent(msg), req.url));
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    const raw = password || `nopass-${randomBytes(16).toString("hex")}`;
    const passwordHash = await bcrypt.hash(raw, 10);

    const user = await prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true },
    });

    // === AUTO LOGIN ===
    const token = buildSessionToken(String(user.id));

    if (wantsHtml) {
      const res = NextResponse.redirect(new URL("/onboarding", req.url), { status: 303 });
      attachSessionCookie(res, token);
      return res;
    } else {
      const res = NextResponse.json({ ok: true, user, next: "/onboarding" }, { status: 201 });
      attachSessionCookie(res, token);
      return res;
    }
  } catch (err) {
    console.error("REGISTER_ERR", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}