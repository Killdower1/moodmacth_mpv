import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session-cookie";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login?logout=1", req.url), { status: 303 });
  clearSessionCookie(res);
  return res;
}