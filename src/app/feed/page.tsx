import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SwipeDeck from "@/components/SwipeDeck";
import { toIntId } from "@/lib/id";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: toIntId(session.user.id) }, select: { currentMood: true } });
  if (!me?.currentMood) redirect("/mood");

  return (
    <section className="px-4 pt-6 pb-10 flex justify-center">
      <div className="w-full max-w-2xl">
        <SwipeDeck mood={me.currentMood} />
      </div>
    </section>
  );
}
