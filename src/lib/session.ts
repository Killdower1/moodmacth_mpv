"use server";

import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";

type SessionLite = { user?: { email?: string | null; id?: string | null } | null } | null;

export async function verifySession(): Promise<Session | null> {
  const s = (await getServerSession(authOptions)) as Session | SessionLite | null;
  return (s && (s as SessionLite)?.user?.email) ? (s as Session) : null;
}

export async function requireSession(): Promise<Session> {
  const s = await verifySession();
  if (!s?.user?.email) throw new Error("Unauthorized");
  return s;
}