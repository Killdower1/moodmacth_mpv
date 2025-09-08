import { prisma } from "@/server/prisma";
import { redirect } from "next/navigation";

/** Minimal guard: dianggap onboarded kalau punya "name". */
export async function ensureOnboarded(me: { id: string }) {
  const u = await prisma.user.findUnique({
    where: { id: String(me.id) },
    select: { name: true }, // hanya field yang pasti ada
  });

  const ok = !!u?.name;
  if (!ok) redirect("/onboarding");
}