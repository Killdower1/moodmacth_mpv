import { createHmac, randomBytes } from "crypto"

const getSecret = () => process.env.AUTH_SECRET || "dev-secret"

function sign(data: string) {
  return createHmac("sha256", getSecret()).update(data).digest("base64url")
}
function pack(obj: any) {
  const data = Buffer.from(JSON.stringify(obj)).toString("base64url")
  const sig = sign(data)
  return `${data}.${sig}`
}
function unpack<T=any>(token?: string|null): T | null {
  if (!token) return null
  const [data, sig] = token.split(".")
  if (!data || !sig) return null
  const expect = sign(data)
  if (expect !== sig) return null
  try { return JSON.parse(Buffer.from(data, "base64url").toString()) }
  catch { return null }
}

export function createSession(email: string) {
  return pack({ email, iat: Date.now() })
}
export function verifySession(token?: string|null) {
  return unpack<{ email: string, iat: number }>(token)
}

export function generateOTP() {
  return (Math.floor(100000 + Math.random() * 900000)).toString()
}

export function createPreauth(email: string, otp: string, ttlMs = 5*60*1000) {
  const exp = Date.now() + ttlMs
  return pack({ email, otp, exp, tries: 0 })
}
export function verifyPreauth(token?: string|null) {
  const v = unpack<{ email: string, otp: string, exp: number, tries: number }>(token)
  if (!v) return null
  if (Date.now() > v.exp) return null
  return v
}

// helper random token (optional)
export function randomToken(n=16) { return randomBytes(n).toString("hex") }
