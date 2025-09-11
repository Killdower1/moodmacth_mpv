import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession, setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const sess = readSession();
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { smoking, alcohol, interests, skip } = await req.json();

  if (skip) {
    await prisma.user.update({ where: { id: sess.uid }, data: { onboardingStep: 3 } });
  } else {
    const list = Array.isArray(interests)
      ? (interests as string[]).map((s) => s.trim()).filter(Boolean)
      : [];

    await prisma.$transaction(async (tx) => {
      if (list.length > 0) {
        await tx.userInterest.deleteMany({ where: { userId: sess.uid } });
        for (const name of list) {
          const interest = await tx.interest.upsert({
            where: { name },
            update: {},
            create: { name },
          });
          await tx.userInterest.create({
            data: { userId: sess.uid, interestId: interest.id },
          });
        }
      }
      await tx.user.update({
        where: { id: sess.uid },
        data: { smoking: smoking ?? null, alcohol: alcohol ?? null, onboardingStep: 3 },
      });
    });
  }

  setSessionCookie({ uid: sess.uid, step: 3 });
  return NextResponse.json({ ok: true, next: "/mood" });
}
