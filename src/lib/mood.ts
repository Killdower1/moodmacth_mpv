
import { prisma } from "@/server/prisma";
import { toIntId } from "@/lib/id";

export async function getCurrentMood(userId: string | number) {
  const id = toIntId(userId);
  const active = await prisma.moodSession.findFirst({
    where: { userId: id, active: true },
    orderBy: { startedAt: "desc" },
    select: { mood: true }});
  if (active) return active.mood;
  const last = await prisma.moodSession.findFirst({
    where: { userId: id },
    orderBy: { startedAt: "desc" },
    select: { mood: true }});
  return last?.mood ?? null;
}



