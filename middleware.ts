import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    // simpan tujuan awal (opsional)
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Lindungi semua kecuali halaman login/register & endpoint auth & aset bawaan
export const config = {
  matcher: [
    '/((?!login|register|api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets|images|public).*)',
  ],
};
