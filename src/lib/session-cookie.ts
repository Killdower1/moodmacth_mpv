import { cookies } from "next/headers";

const NAME = "mm_session";

function toB64Url(s: string) {
  return Buffer.from(s, "utf8").toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64Url(t: string) {
  const pad = t.length % 4 === 0 ? "" : "=".repeat(4 - (t.length % 4));
  return Buffer.from(t.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString("utf8");
}

export function buildSessionToken(userId: string) {
  return toB64Url(JSON.stringify({ userId, iat: Date.now() }));
}

export function parseSessionToken(token?: string | null) {
  try {
    if (!token) return null;
    const payload = JSON.parse(fromB64Url(token));
    if (typeof payload?.userId === "string") return { userId: payload.userId as string };
    return null;
  } catch { return null; }
}

export function readSession() {
  const token = cookies().get(NAME)?.value;
  return parseSessionToken(token);
}

export function attachSessionCookie(res: Response & { cookies?: any }, token: string) {
  const maxAge = 60 * 60 * 24 * 30; // 30 hari
  if ((res as any).cookies?.set) {
    (res as any).cookies.set(NAME, token, {
      httpOnly: true, sameSite: "lax", path: "/", secure: false, maxAge
    });
  } else {
    res.headers.append("Set-Cookie", `${NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
  }
}

export function clearSessionCookie(res: Response & { cookies?: any }) {
  if ((res as any).cookies?.set) {
    (res as any).cookies.set(NAME, "", { path: "/", maxAge: 0 });
  } else {
    res.headers.append("Set-Cookie", `${NAME}=; Path=/; Max-Age=0`);
  }
}