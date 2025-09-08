import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists?.passwordHash) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    if (exists && !exists.passwordHash) {
      await prisma.user.update({ where: { email }, data: { name: name ?? exists.name, passwordHash } });
      return NextResponse.json({ upgraded: true });
    }
    const user = await prisma.user.create({ data: { name: name ?? email, email, passwordHash } });
    return NextResponse.json({ id: user.id });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
