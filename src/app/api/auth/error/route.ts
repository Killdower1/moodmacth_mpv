import { NextResponse } from "next/server";

function go(req: Request, toPath: string) {
  const src = new URL(req.url);
  const to = new URL(toPath, req.url);
  const msg = src.searchParams.get("error");
  if (msg) to.searchParams.set("error", msg);
  return NextResponse.redirect(to, { status: 303 });
}

export async function GET(req: Request) {
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    const url = new URL(req.url);
    return NextResponse.json({ ok: false, error: url.searchParams.get("error") ?? "Unknown", next: "/onboarding" });
  }
  return go(req, "/onboarding");
}

export async function POST(req: Request) {
  return go(req, "/onboarding");
}