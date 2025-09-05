import { NextResponse } from "next/server";
export async function POST(req: Request) {
  return NextResponse.redirect("/api/auth/register", 307);
}