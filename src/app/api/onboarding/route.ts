import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";

const OnboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/)
    .transform((v) => v.toLowerCase()),
  name: z.string().min(1),
  bio: z.string().max(160).optional(),
  gender: z.string().optional(),
  birthdate: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    log("POST /api/onboarding: Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = OnboardingSchema.safeParse(body);
  if (!parsed.success) {
    log("POST /api/onboarding: Validation error", parsed.error.flatten());
    return NextResponse.json({ error: "Validation error" }, { status: 400 });
  }
  const data: any = {
    username: parsed.data.username,
    name: parsed.data.name,
  };
  if (parsed.data.bio) data.bio = parsed.data.bio;
  if (parsed.data.gender) data.gender = parsed.data.gender;
  if (parsed.data.birthdate) data.birthdate = new Date(parsed.data.birthdate);
  if (parsed.data.avatarUrl) data.avatarUrl = parsed.data.avatarUrl;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        gender: true,
        birthdate: true,
        avatarUrl: true,
      },
    });
    return NextResponse.json(user);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Username/email already used" },
        { status: 409 }
      );
    }
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    log("POST /api/onboarding: Internal server error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
