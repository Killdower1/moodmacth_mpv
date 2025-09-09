import { getServerSession } from "next-auth";
// NOTE: SESUAIKAN path ini jika file options berbeda di repo kamu
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Response("UNAUTHORIZED", { status: 401 });
  return String(session.user.id);
}
