import { NextResponse } from "next/server";
import { destroySessionCookie } from "@/lib/session-cookie";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  destroySessionCookie(res);
  return res;
}