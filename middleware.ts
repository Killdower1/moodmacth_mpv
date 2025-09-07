import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_req: NextRequest) {
  return NextResponse.next(); // pass-through
}

// Jalankan HANYA untuk non-API routes (exclude /api, /_next, /static)
export const config = {
  matcher: ["/((?!api|_next|static|favicon\\.ico).*)"],
};
