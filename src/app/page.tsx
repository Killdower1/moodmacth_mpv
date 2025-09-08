import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifySession } from "@/lib/auth"
export default async function Page() {
  const token = cookies().get("session")?.value
  if (verifySession(token)) redirect("/home")
  redirect("/login")
}
