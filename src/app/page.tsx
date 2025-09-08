import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import store from "@/lib/mock-auth"

export default function Page() {
  const token = cookies().get("session")?.value
  if (token && (store as any).sessions?.[token]) redirect("/mood")
  redirect("/login")
}