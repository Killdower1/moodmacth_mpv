import { requireUser } from "@/lib/auth";
import { prisma } from "@/server/prisma";
import { redirect } from "next/navigation";

export async function ensureOnboarded() {
  const me = await requireUser();
  try {
    const u = await prisma.user.findUnique({
      where: { id: String(me.id) },
      select: { name: true, birthdate: true, gender: true }
    });
    // Aturan minimal onboard: punya name + birthdate atau gender
    const ok = !!(u?.name && (u.birthdate || u.gender));
    if (!ok) redirect("/onboarding");
  } catch {
    // kalau error prisma, biarin masuk (jangan bikin infinite loop)
  }
}
