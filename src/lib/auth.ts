import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export { authOptions };

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  return session.user as { id: string; email?: string | null; name?: string | null };
}
