// Simple in-memory rate limiter (per-process). Cocok untuk dev/MVP.
type Bucket = { ts: number[]; limit: number; windowMs: number };
const store = new Map<string, Bucket>();

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  let b = store.get(key);
  if (!b) {
    b = { ts: [], limit, windowMs };
    store.set(key, b);
  }
  // drop timestamp lama
  b.ts = b.ts.filter(t => now - t < windowMs);
  if (b.ts.length >= limit) {
    const retry = Math.max(0, windowMs - (now - b.ts[0]));
    const err: any = new Error("Rate limit exceeded");
    err.status = 429;
    err.retryAfterMs = retry;
    throw err;
  }
  b.ts.push(now);
}



