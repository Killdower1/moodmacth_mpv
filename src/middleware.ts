import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protect every route except login/register, next internals, public assets, and NextAuth endpoints
export const config = {
  matcher: [
    "/((?!login|register|api/auth|_next|favicon.ico|robots.txt|sitemap.xml|public).*)",
  ],
};

export function middleware(req: NextRequest) {
  const hasSession =
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value;

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}