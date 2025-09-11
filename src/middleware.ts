import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_SECRET!;
const COOKIE = "mm_session";

function readStep(req: NextRequest): number | null {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET) as any;
    return typeof payload.step === "number" ? payload.step : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/uploads") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const step = readStep(req);
  if (step === null) return NextResponse.next();

  if (step < 3) {
    const target = step < 1 ? "/onboarding/1" : step < 2 ? "/onboarding/2" : "/onboarding/3";
    const allowed = ["/register", "/login", "/onboarding/1", "/onboarding/2", "/onboarding/3"];
    if (!allowed.includes(pathname) && !pathname.startsWith("/onboarding")) {
      const url = req.nextUrl.clone();
      url.pathname = target;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|uploads).*)"],
};
