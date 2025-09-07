import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10); // <- STRING

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash, // <- SIMPAN STRING, BUKAN Buffer
      },
      select: { id: true, email: true },
    });

    return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002" && e?.meta?.target?.includes?.("email")) {
      return NextResponse.json({ error: "Email already used" }, { status: 409 });
    }
    return NextResponse.json({ error: e?.message ?? "register_failed" }, { status: 500 });
  }
}
