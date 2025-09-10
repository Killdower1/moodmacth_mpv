import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Bypass aset & file statis
  if (path.startsWith('/_next') || path === '/favicon.ico' || path.includes('.')) {
    return NextResponse.next();
  }

  // ⚠️ Allow API yang perlu diakses sebelum login (biar /api/mood bisa di-fetch dari /mood)
  if (path.startsWith('/api/mood')) {
    return NextResponse.next();
  }

  // Bypass halaman & endpoint auth
  if (path === '/login' || path === '/register' || path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Deteksi beberapa nama cookie session yg mungkin dipakai app ini
  const session =
    req.cookies.get('session')?.value ||
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('mm_session')?.value ||
    req.cookies.get('mm_sess')?.value;

  const loggedIn = Boolean(session);
  console.log(\[guard] \ \ \\);

  if (!loggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    // simpan tujuan awal
    url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Matcher luas; logika whitelist di atas yang nentuin lolos/tidak
export const config = {
  matcher: ['/((?!_next).*)'],
};
