import { cookies } from "next/headers"

export const authOptions: any = {}

export async function requireUser(..._args: any[]): Promise<any> {
  const token = cookies().get("session")?.value
  if (token) return { id: "dev", email: "demo@example.com" }
  throw new Error("Unauthorized")
}
export async function verifyPreauth(..._args: any[]) { return true }

export async function createSession(..._args:any[]){ return { ok:true } }
export async function verifySession(..._args:any[]){ return { user:{ id:'dev', email:'demo@example.com' } } }