import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { log } from "@/lib/logger";

const RegisterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
  username: z.string().trim().min(3).max(32).regex(/^\w+$/).optional(),
  name: z.string().trim().min(1).optional(),
});

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type harus application/json" },
        { status: 415 }
      );
    }
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      log("POST /api/auth/register: validation error", parsed.error.flatten());
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, username, email, password: pwd } = parsed.data;
    const passwordHash = await bcrypt.hash(pwd, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username: username ?? null,
        name: name ?? null,
        passwordHash,
      },
      select: { id: true, email: true, username: true, name: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      log("POST /api/auth/register: duplicate", err);
      return NextResponse.json(
        { error: "Email atau username sudah dipakai" },
        { status: 409 }
      );
    }
    log("POST /api/auth/register: error", err?.message || err);
    return NextResponse.json({ error: "Register gagal" }, { status: 500 });
  }
}
