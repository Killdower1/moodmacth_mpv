import { NextResponse } from "next/server";
export async function GET(req: Request) {
  const to = new URL("/login", req.url);
  return NextResponse.redirect(to);
}