import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FeedClient from "./FeedClient";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, gender: true, birthdate: true },
  });

  if (!user?.name || !user?.gender || !user?.birthdate) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <FeedClient />
    </div>
  );
}
