import { prisma } from "@/lib/prisma";
import { toIntId } from "@/lib/id";

export async function getCurrentMood(userId: string | number) {
  const id = toIntId(userId);
  const last = await prisma.moodSession.findFirst({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    select: { mood: true },
  });
  return last?.mood ?? null;
}
