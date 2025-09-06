import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { log } from "@/lib/logger";

const OnboardSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^\w+$/),
  name: z.string().trim().min(1),
  bio: z.string().trim().max(500).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthdate: z.string(),
  avatarUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    log("POST /api/onboarding: Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  if (Number.isNaN(userId)) {
    log("POST /api/onboarding: Bad user id", session.user.id);
    return NextResponse.json({ error: "Bad user id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = OnboardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { username, name, bio, gender, birthdate, avatarUrl } = parsed.data;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        name,
        bio,
        gender,
        birthdate: new Date(birthdate),
        avatarUrl,
      },
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
        { error: "Username sudah dipakai" },
        { status: 409 }
      );
    }
    log("POST /api/onboarding: error", err?.message || err);
    return NextResponse.json({ error: "Onboarding gagal" }, { status: 500 });
  }
}
