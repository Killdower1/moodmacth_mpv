import { cookies } from "next/headers";

export const NAME = "mm_sess";

function toB64Url(s: string) {
  return Buffer.from(s, "utf8").toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64Url(t: string) {
  const pad = "=".repeat((4 - (t.length % 4)) % 4);
  return Buffer.from(t.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString("utf8");
}

export function buildSessionToken(userId: string) {
  return toB64Url(JSON.stringify({ userId, iat: Date.now() }));
}
export function parseSessionToken(token?: string | null) {
  try {
    if (!token) return null;
    const payload = JSON.parse(fromB64Url(token));
    if (!payload?.userId) return null;
    return { userId: String(payload.userId), iat: Number(payload.iat) || Date.now() };
  } catch { return null; }
}

/** Baca cookie dari REQUEST di Route Handler */
export function readSession() {
  const token = cookies().get(NAME)?.value;
  return parseSessionToken(token);
}

/** Tulis cookie ke RESPONSE saat ini */
export function setSessionCookie(token: string) {
  cookies().set({
    name: NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // secure tidak perlu di localhost; tambahkan di prod:
    // secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 hari
  });
}

/** Hapus cookie di RESPONSE saat ini */
export function clearSessionCookie() {
  cookies().set({ name: NAME, value: "", path: "/", maxAge: 0 });
}