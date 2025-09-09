import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export function getCurrentUserIdOrThrow() {
  const token = cookies().get('session')?.value;
  if (!token) throw new Error('NO_SESSION');
  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';
  const payload = jwt.verify(token, secret) as any;
  return String(payload.sub);
}
