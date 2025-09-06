import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const EditableSchema = z.object({
  name: z.string().min(1).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthdate: z.string().optional(),
  image: z.string().url().optional(),
});

const log = (...args: any[]) => {
  if (process.env.NODE_ENV !== "production") console.log(...args);
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    log("GET /api/me: Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  if (Number.isNaN(userId)) {
    log("GET /api/me: Bad user id", session.user.id);
    return NextResponse.json({ error: "Bad user id" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, gender: true, birthdate: true, image: true },
  });
  if (!user) {
    log("GET /api/me: User not found", userId);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    log("PATCH /api/me: Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  if (Number.isNaN(userId)) {
    log("PATCH /api/me: Bad user id", session.user.id);
    return NextResponse.json({ error: "Bad user id" }, { status: 400 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    log("PATCH /api/me: Invalid JSON");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = EditableSchema.safeParse(body);
  if (!parsed.success) {
    log("PATCH /api/me: Validation error", parsed.error.flatten());
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }
  const updateData: any = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.gender) updateData.gender = parsed.data.gender;
  if (parsed.data.birthdate) updateData.birthdate = new Date(parsed.data.birthdate);
  if (parsed.data.image) updateData.image = parsed.data.image;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, gender: true, birthdate: true, image: true },
    });
    return NextResponse.json(user);
  } catch (err: any) {
    if (err?.code === "P2002") {
      log("PATCH /api/me: Duplicate value", err);
      return NextResponse.json({ error: "Duplicate value" }, { status: 409 });
    }
    if (err?.code === "P2025") {
      log("PATCH /api/me: User not found", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    log("PATCH /api/me: Internal server error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function login(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    log("POST /api/auth/login: Invalid JSON");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().min(6),
    })
    .safeParse(body);
  if (!parsed.success) {
    log("POST /api/auth/login: Validation error", parsed.error.flatten());
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return { id: user.id, email: user.email, name: user.name ?? "" };
}

export async function register(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    log("POST /api/auth/register: Invalid JSON");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = z
    .object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      confirmPassword: z.string().min(6),
    })
    .safeParse(body);
  if (!parsed.success) {
    log("POST /api/auth/register: Validation error", parsed.error.flatten());
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.password !== parsed.data.confirmPassword) {
    log("POST /api/auth/register: Passwords do not match");
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { ...parsed.data, email, passwordHash: hashedPassword },
      select: { id: true, email: true, name: true, gender: true, birthdate: true, image: true },
    });
    return NextResponse.json(user);
  } catch (err: any) {
    if (err?.code === "P2002") {
      log("POST /api/auth/register: Duplicate value", err);
      return NextResponse.json({ error: "Duplicate value" }, { status: 409 });
    }
    log("POST /api/auth/register: Internal server error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function logout(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    log("POST /api/auth/logout: Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // handle logout logic, e.g., by deleting a session or token
  return NextResponse.json({ message: "Logout successful" });
}