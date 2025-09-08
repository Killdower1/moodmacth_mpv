
import { prisma } from "@/server/prisma";
import { toIntId } from "@/lib/id";

export async function getCurrentMood(userId: string | number) {
  const id = String(userId);
  const active = await prisma.moodSession.findFirst({
    where: { userId: String(id) },
    orderBy: { id: "desc" },
    select: { mood: true }});
  if (active) return active.mood;
  const last = await prisma.moodSession.findFirst({
    where: { userId: String(id) },
    orderBy: { id: "desc" },
    select: { mood: true }});
  return last?.mood ?? null;
}



