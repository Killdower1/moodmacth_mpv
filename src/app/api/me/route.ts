import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { log } from "@/lib/logger";

const EditableSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().trim().min(3).max(32).optional(),
  bio: z.string().trim().max(500).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthdate: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

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
    select: { id: true, email: true, username: true, name: true, bio: true, gender: true, birthdate: true, avatarUrl: true },
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
  const updateData: Record<string, any> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.username) updateData.username = parsed.data.username;
  if (parsed.data.bio) updateData.bio = parsed.data.bio;
  if (parsed.data.gender) updateData.gender = parsed.data.gender;
  if (parsed.data.birthdate) updateData.birthdate = new Date(parsed.data.birthdate);
  if (parsed.data.avatarUrl) updateData.avatarUrl = parsed.data.avatarUrl;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, username: true, name: true, bio: true, gender: true, birthdate: true, avatarUrl: true },
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
