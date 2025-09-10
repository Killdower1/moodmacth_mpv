import 'server-only';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

type TokenObj = { sub?: string; id?: string; uid?: string; userId?: string } | string;

function extractUserId(payload: any): string | null {
  if (!payload || typeof payload === 'string') return null;
  return (
    (payload.sub && String(payload.sub)) ||
    (payload.userId && String(payload.userId)) ||
    (payload.id && String(payload.id)) ||
    (payload.uid && String(payload.uid)) ||
    null
  );
}

/** Cari userId dari cookie yang berisi JWT (tanpa verify). */
export function decodeUserIdFromSession(): string | null {
  const jar = cookies();

  // Kandidat nama cookie yang umum dipakai
  const candidates = [
    'session',
    'token',
    'auth',
    'app_session',
    'mm_session',
    'next-auth.session-token',
    '__Secure-next-auth.session-token'
  ];

  // 1) Coba kandidat spesifik dulu
  for (const name of candidates) {
    const val = jar.get(name)?.value;
    if (!val) continue;
    try {
      const payload = jwt.decode(val) as any;
      const uid = extractUserId(payload);
      if (uid) return uid;
    } catch {}
  }

  // 2) Fallback: scan semua cookie, cari yang format JWT (3 bagian dipisah '.')
  try {
    for (const c of jar.getAll()) {
      const v = c.value;
      if (!v || v.split('.').length !== 3) continue;
      const payload = jwt.decode(v) as any;
      const uid = extractUserId(payload);
      if (uid) return uid;
    }
  } catch {}

  // Debug minimal (server log saja)
  try {
    const names = jar.getAll().map(c => c.name).join(', ');
    console.warn('[session] no user id from cookies. available cookies:', names);
  } catch {}

  return null;
}

/** Verify pakai secret (untuk endpoint sensitif, kalau diperlukan) */
export function tryGetCurrentUserId(): string | null {
  const jar = cookies();
  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';

  // urutan sama: kandidat dulu, lalu scan semua
  const candidates = [
    'session',
    'token',
    'auth',
    'app_session',
    'mm_session',
    'next-auth.session-token',
    '__Secure-next-auth.session-token'
  ];

  for (const name of candidates) {
    const val = jar.get(name)?.value;
    if (!val) continue;
    try {
      const payload = jwt.verify(val, secret) as TokenObj;
      if (typeof payload !== 'string') {
        const uid =
          payload.sub || payload.userId || payload.id || payload.uid || null;
        if (uid) return String(uid);
      }
    } catch {}
  }

  try {
    for (const c of jar.getAll()) {
      const v = c.value;
      if (!v || v.split('.').length !== 3) continue;
      try {
        const payload = jwt.verify(v, secret) as TokenObj;
        if (typeof payload !== 'string') {
          const uid =
            payload.sub || payload.userId || payload.id || payload.uid || null;
          if (uid) return String(uid);
        }
      } catch {}
    }
  } catch {}

  return null;
}

export function getCurrentUserIdOrThrow(): string {
  const id = tryGetCurrentUserId();
  if (!id) throw new Error('NO_SESSION');
  return id;
}
