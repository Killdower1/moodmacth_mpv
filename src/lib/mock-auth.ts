type OTPRec = { code: string; expires: number }
type SessRec = { email: string; expires: number }
type Store = { otps: Record<string, OTPRec>; sessions: Record<string, SessRec> }

const g = globalThis as any
const store: Store = g.__mockStore ?? { otps: {}, sessions: {} }
if (!g.__mockStore) g.__mockStore = store

function genCode(): string {
  return (Math.floor(100000 + Math.random() * 900000)).toString()
}
function genToken(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function issueOtp(email: string) {
  const code = genCode()
  store.otps[email] = { code, expires: Date.now() + 5 * 60 * 1000 }
  return code
}
export function verifyOtp(email: string, code: string) {
  const rec = store.otps[email]
  if (!rec) return false
  const ok = rec.code === code && rec.expires > Date.now()
  if (ok) delete store.otps[email]
  return ok
}
export function createSession(email: string) {
  const token = genToken()
  store.sessions[token] = { email, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 }
  return token
}
export function getEmailFromToken(token?: string | null) {
  if (!token) return null
  const rec = store.sessions[token]
  if (!rec || rec.expires < Date.now()) return null
  return rec.email
}
export function destroySession(token?: string | null) {
  if (!token) return
  delete store.sessions[token]
}

export const users = [{ email: "demo@example.com", password: "demo123" }]

export default store