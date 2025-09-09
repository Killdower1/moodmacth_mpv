import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import store from "@/lib/mock-auth"

export default function Layout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("session")?.value
  const ok = token && (store as any).sessions?.[token]
  if (!ok) redirect("/login")
  return <>{children}</>
}