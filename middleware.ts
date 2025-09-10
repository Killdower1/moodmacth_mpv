import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession } from "./src/lib/auth"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // allow public paths
  const publicPaths = ["/login", "/api", "/_next", "/favicon.ico", "/manifest.webmanifest", "/assets"]
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next()
  }
  const token = req.cookies.get("session")?.value
  if (!verifySession(token)) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

// lindungi semua kecuali /login, /api, dll
export const config = {
  matcher: [
  "/((?!login|register|create-account|onboarding|api/auth|api/mood|_next|favicon.ico).*)",
],
}

