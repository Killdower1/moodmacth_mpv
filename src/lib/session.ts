import 'server-only';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

type Token = { sub?: string } | string;

export function tryGetCurrentUserId(): string | null {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';
  try {
    const payload = jwt.verify(token, secret) as Token;
    if (typeof payload === 'string') return null;
    return payload?.sub ? String(payload.sub) : null;
  } catch {
    return null;
  }
}

export function getCurrentUserIdOrThrow(): string {
  const id = tryGetCurrentUserId();
  if (!id) throw new Error('NO_SESSION');
  return id;
}
