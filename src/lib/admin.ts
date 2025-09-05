import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdminEmails() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || "";
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!email || !admins.includes(email.toLowerCase())) {
    throw new Error("Forbidden");
  }
  return { email };
}
