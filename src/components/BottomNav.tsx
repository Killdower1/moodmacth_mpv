"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Smile, HeartHandshake, UserRound, Settings } from "lucide-react";

const items = [
  { href: "/mood",    label: "Mood",    icon: Smile },
  { href: "/matches", label: "Matches", icon: HeartHandshake },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings",label: "Settings",icon: Settings },
];

export default function BottomNav(){
  const p = usePathname() || "/";
  return (
    <div className="tabbar-wrap">
      <nav className="tabbar" role="navigation" aria-label="Bottom tabs">
        {items.map(it=>{
          const Icon = it.icon;
          const active = p.startsWith(it.href);
          return (
            <Link key={it.href} href={it.href} className={`tabbtn ${active?"active":""}`}>
              <Icon aria-hidden />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}