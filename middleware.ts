import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/home", "/mood", "/match", "/chat", "/me", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + "/"));
  const isLogin = pathname.startsWith("/login");

  // NextAuth (JWT) cookie names
  const hasSession =
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value;

  // Belum login akses protected -> redirect ke /login?next=...
  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Sudah login tapi ke /login -> dorong ke /home
  if (hasSession && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Jalankan middleware untuk semua path kecuali _next, api, dan file statis
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};