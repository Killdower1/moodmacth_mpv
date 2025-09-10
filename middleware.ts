import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Allow auth pages & endpoints
  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Allow assets/_next/seo files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get('session')?.value;
  const loggedIn = Boolean(session);

  // LOG ke console server
  console.log([guard]   );

  if (!loggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname + (search ?? ''));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Lindungi semua route selain aset statis, biar aman di dev & prod
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/|images/).*)'],
};
