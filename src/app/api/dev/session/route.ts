import { NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  // Hanya aktif saat development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid') || 'dev-user';
  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';

  const token = jwt.sign({ sub: uid }, secret, { expiresIn: '7d' });

  const res = NextResponse.json({ ok: true, uid });
  res.cookies.set('session', token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });
  return res;
}
