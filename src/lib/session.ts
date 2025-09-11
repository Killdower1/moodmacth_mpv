import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_SECRET || "dev-secret";
const COOKIE = "mm_session";
const COOKIE_2FA = "mm_2fa";

export type Sess = { uid: string; step: number };

export function signSession(payload: Sess) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function setSessionCookie(sess: Sess) {
  const token = signSession(sess);
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 3600,
  });
}

export function readSession(): Sess | null {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try { return jwt.verify(token, SECRET) as Sess; } catch { return null; }
}

export function clearSessionCookie() {
  cookies().delete(COOKIE);
}

/** ===== 2FA =====
 * Terima { uid, exp? } (ms). Kita TIDAK menaruh exp ke payload JWT.
 * Kita hitung maxAge dan sign payload { uid } + options.expiresIn.
 */
export type TwoFa = { uid: string; exp?: number };

export function set2faCookie(data: TwoFa) {
  const maxAge = data.exp
    ? Math.max(60, Math.floor((data.exp - Date.now()) / 1000))
    : 5 * 60; // default 5 menit

  const token = jwt.sign({ uid: data.uid }, SECRET, { expiresIn: maxAge });

  cookies().set(COOKIE_2FA, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export function read2fa(): TwoFa | null {
  const token = cookies().get(COOKIE_2FA)?.value;
  if (!token) return null;
  try {
    const dec = jwt.verify(token, SECRET) as any;
    const expMs = dec?.exp ? dec.exp * 1000 : undefined;
    return { uid: dec.uid, exp: expMs };
  } catch {
    return null;
  }
}

export function clear2fa() {
  cookies().delete(COOKIE_2FA);
}