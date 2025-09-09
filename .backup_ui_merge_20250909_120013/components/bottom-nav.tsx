"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Heart, User, Settings } from "lucide-react"
const items = [
  { href: "/mood", icon: Home, label: "Swipe" },
  { href: "/matches", icon: Heart, label: "Matches" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
]
export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname?.startsWith(href)
          return (
            <Link key={href} href={href} className={`flex flex-col items-center py-2 text-xs ${active ? "text-primary" : ""}`}>
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
