import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session-cookie";

export async function POST() {
  clearSessionCookie();            // <- tidak pakai argumen lagi
  return NextResponse.json({ ok: true });
}

// optional: GET untuk testing gampang di browser
export async function GET() {
  return POST();
}