import { NextResponse } from "next/server";

function toOnboarding(req: Request) {
  const url = new URL("/onboarding", req.url);
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  return toOnboarding(req);
}
export async function POST(req: Request) {
  // Kalau FE pakai POST via form/fetch, balas JSON supaya FE bisa navigate manual
  return NextResponse.json({ ok: true, next: "/onboarding" });
}