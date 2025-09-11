import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest){
  try{
    const body = await req.json();
    const username = (body?.username || "").trim();
    const email = (body?.email || null) ? String(body.email).trim() : null;
    const password = String(body?.password || "");
    const inputName = typeof body?.name === "string" ? body.name.trim() : "";
    const name = inputName || username; // <-- fallback penting biar lolos schema

    if (!username || !password) {
      return NextResponse.json({ error: "username & password wajib" }, { status: 400 });
    }

    // Cek unik username/email
    const exist = await prisma.user.findFirst({
      where: { OR: [{ username }, ...(email ? [{ email }] : []) ] },
      select: { id:true }
    });
    if (exist) return NextResponse.json({ error: "Username/Email sudah dipakai" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);

    const u = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        onboardingStep: 0,
        name, // <-- diisi
      },
      select: { id: true, onboardingStep: true }
    });

    setSessionCookie({ uid: u.id, step: u.onboardingStep ?? 0 });
    return NextResponse.json({ ok: true, next: "/onboarding/1" });
  }catch(e:any){
    console.error("REGISTER_ERR", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}