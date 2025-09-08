import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import crypto from "crypto";

export const COOKIE_NAME = "mm_session";
const secret = process.env.AUTH_SECRET || "dev-secret";
const isProd = process.env.NODE_ENV === "production";

function sign(payload: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function buildSessionToken(userId: string) {
  const ts = Date.now().toString();
  const payload = `${userId}.${ts}`;
  const token = `${payload}.${sign(payload)}`;
  return token;
}

export function attachSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}

export function readSession(): { userId: string } | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts;
  const payload = `${userId}.${ts}`;
  if (sig !== sign(payload)) return null;
  return { userId };
}

export function destroySessionCookie(res: NextResponse) {
  // delete via expired cookie
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 0,
  });
}