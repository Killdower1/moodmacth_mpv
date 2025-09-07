import { getServerSession } from "next-auth";
export { authOptions } from "@/app/api/auth/[...nextauth]/options";
export async function requireUser() {
  const s = await getServerSession(authOptions);
  if (!s?.user?.id) throw new Error("UNAUTHENTICATED");
  return s.user as { id: string; email?: string | null; name?: string | null };
}

