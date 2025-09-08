#!/usr/bin/env bash
set -euo pipefail

echo "==> 0) Matikan dev server dulu (Ctrl+C kalau lagi jalan)"

# 1) Install deps UI (stable)
echo "==> 1) Installing Tailwind v3 + deps"
npm i -D tailwindcss@3 autoprefixer postcss
npm i next-themes framer-motion lucide-react react-hook-form zod clsx tailwind-merge

# 2) Init Tailwind/PostCSS
echo "==> 2) tailwindcss init -p"
npx tailwindcss init -p

# 3) postcss.config.js
echo "==> 3) Writing postcss.config.js"
cat > postcss.config.js <<'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 4) tailwind.config.ts
echo "==> 4) Writing tailwind.config.ts"
cat > tailwind.config.ts <<'EOF'
import type { Config } from 'tailwindcss'

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: { brand: { DEFAULT: "#7C3AED", foreground: "#ffffff" } },
      borderRadius: { xl: "1rem", "2xl": "1.5rem" },
    },
  },
  plugins: [],
} satisfies Config
EOF

# 5) Siapkan struktur folder
echo "==> 5) Ensuring folders"
mkdir -p src/app src/components src/components/ui src/lib

# 6) Globals CSS (App Router)
echo "==> 6) Writing src/app/globals.css"
cat > src/app/globals.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
/* smoothing */
:root { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
EOF

# 7) Disable UI lama (Pages Router) kalau ada
echo "==> 7) Disabling legacy pages router (navbar kuning)"
if [ -d pages ]; then mv pages _pages_legacy 2>/dev/null || true; fi
if [ -d src/pages ]; then mv src/pages src/_pages_legacy 2>/dev/null || true; fi

# 8) next.config.mjs (allow image domains)
echo "==> 8) Patching next.config.mjs"
if [ -f next.config.mjs ]; then cp next.config.mjs next.config.mjs.bak; fi
cat > next.config.mjs <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.jsdelivr.net","images.unsplash.com","lh3.googleusercontent.com","res.cloudinary.com"],
  },
}
export default nextConfig
EOF

# 9) tsconfig paths '@/'
echo "==> 9) Patching tsconfig.json paths (@/* -> ./src/*)"
if [ -f tsconfig.json ]; then
node - <<'NODE'
const fs=require('fs');const p='tsconfig.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.compilerOptions=j.compilerOptions||{};
j.compilerOptions.baseUrl=j.compilerOptions.baseUrl||'.';
j.compilerOptions.paths=j.compilerOptions.paths||{};
if(!j.compilerOptions.paths['@/*']) j.compilerOptions.paths['@/*']=['./src/*'];
fs.writeFileSync(p,JSON.stringify(j,null,2));
console.log('tsconfig patched');
NODE
fi

# 10) util cn()
echo "==> 10) lib/cn.ts"
cat > src/lib/cn.ts <<'EOF'
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: any[]) { return twMerge(clsx(inputs)) }
EOF

# 11) ThemeProvider
echo "==> 11) Theme provider"
cat > src/components/theme-provider.tsx <<'EOF'
'use client'
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      {children}
    </NextThemesProvider>
  )
}
EOF

# 12) UI primitives (tanpa shadcn CLI supaya simple)
echo "==> 12) UI primitives"
cat > src/components/ui/button.tsx <<'EOF'
import * as React from "react"
import { cn } from "@/lib/cn"
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent",
        "px-4 py-2 text-sm font-medium transition-colors",
        "bg-primary text-primary-foreground hover:opacity-90",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"
EOF

cat > src/components/ui/input.tsx <<'EOF'
import * as React from "react"
import { cn } from "@/lib/cn"
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border bg-background px-3 py-2 text-sm",
        "outline-none ring-0 focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"
EOF

cat > src/components/ui/card.tsx <<'EOF'
import * as React from "react"
import { cn } from "@/lib/cn"
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border bg-card text-card-foreground shadow-sm", className)} {...props} />
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 pt-0", className)} {...props} />
}
EOF

cat > src/components/ui/avatar.tsx <<'EOF'
import * as React from "react"
import { cn } from "@/lib/cn"
export function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-muted", className)} {...props}>{children}</div>
}
export function AvatarImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img className="h-full w-full object-cover" {...props} />
}
export function AvatarFallback({ children }: { children?: React.ReactNode }) {
  return <span className="text-sm font-medium text-muted-foreground">{children}</span>
}
EOF

# 13) AppShell + BottomNav
echo "==> 13) AppShell + BottomNav"
cat > src/components/app-shell.tsx <<'EOF'
import { BottomNav } from "@/components/bottom-nav"
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="container max-w-md pb-20 pt-4">{children}</div>
      <BottomNav />
    </div>
  )
}
EOF

cat > src/components/bottom-nav.tsx <<'EOF'
'use client'
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
EOF

# 14) Root layout + redirect root -> /login
echo "==> 14) Root layout + redirect"
cat > src/app/layout.tsx <<'EOF'
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
export const metadata: Metadata = { title: "Moodmacth", description: "Swipe with mood" }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  )
}
EOF

cat > src/app/page.tsx <<'EOF'
import { redirect } from "next/navigation"
export default function Page(){ redirect("/login"); return null }
EOF

# 15) Pages: login, mood, profile, settings
echo "==> 15) Pages (login/mood/profile/settings)"
mkdir -p src/app/login src/app/mood src/app/profile src/app/settings

cat > src/app/login/page.tsx <<'EOF'
'use client'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
const schema = z.object({ phone: z.string().min(9, "Masukkan nomor HP yang valid") })
export default function LoginPage() {
  const [sent, setSent] = useState(false)
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { phone: "" } })
  const onSubmit = async (values: any) => { setSent(true) } // TODO: /api/auth/otp/request
  return (
    <div className="flex min-h-[80dvh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Masuk dengan Nomor HP</CardTitle></CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Input placeholder="08xxxxxxxxxx" {...form.register("phone")} />
              <Button className="w-full" type="submit">Kirim Kode</Button>
            </form>
          ) : (<OTPForm />)}
        </CardContent>
      </Card>
    </div>
  )
}
function OTPForm() {
  const [code, setCode] = useState("")
  const submit = async () => {} // TODO: /api/auth/otp/verify
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input key={i} maxLength={1}
            className="h-12 w-full rounded-xl border bg-background text-center text-xl outline-none focus:ring"
            value={code[i] ?? ""}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, "")
              const next = code.substring(0, i) + (v ? v[0] : "") + code.substring(i + 1)
              setCode(next)
            }}
          />
        ))}
      </div>
      <Button className="w-full" onClick={submit}>Verifikasi</Button>
    </div>
  )
}
EOF

cat > src/app/mood/page.tsx <<'EOF'
'use client'
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Heart } from "lucide-react"
const mockProfiles = [
  { id: 1, name: "Alya, 24", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
  { id: 2, name: "Dimas, 26", img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe" },
]
export default function MoodPage() {
  return (
    <AppShell>
      <div className="space-y-3">
        {mockProfiles.map((p) => (
          <motion.div key={p.id} drag="x" whileTap={{ scale: 0.98 }} className="cursor-grab active:cursor-grabbing">
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/5] w-full">
                <Image src={p.img} alt={p.name} fill sizes="(max-width: 768px) 100vw" className="object-cover" />
              </div>
              <CardContent className="p-4"><div className="text-lg font-semibold">{p.name}</div></CardContent>
            </Card>
          </motion.div>
        ))}
        <div className="sticky bottom-24 z-40 mt-2 flex items-center justify-center gap-6">
          <Button className="rounded-2xl"><X className="mr-2 h-5 w-5"/>Skip</Button>
          <Button className="rounded-2xl"><Heart className="mr-2 h-5 w-5"/>Like</Button>
        </div>
      </div>
    </AppShell>
  )
}
EOF

cat > src/app/profile/page.tsx <<'EOF'
import { AppShell } from "@/components/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
export default function ProfilePage() {
  return (
    <AppShell>
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-semibold">Moodmacther</div>
            <div className="text-sm text-muted-foreground">Edit profile → (nyusul)</div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
EOF

cat > src/app/settings/page.tsx <<'EOF'
'use client'
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Tema saat ini: {theme}</div>
        <div className="flex gap-2">
          <Button onClick={() => setTheme('light')}>Light</Button>
          <Button onClick={() => setTheme('dark')}>Dark</Button>
          <Button onClick={() => setTheme('system')}>System</Button>
        </div>
        <Button variant="outline">Logout</Button>
      </div>
    </AppShell>
  )
}
EOF

# 16) Bersihkan cache Next
echo "==> 16) Clean .next cache"
rm -rf .next

echo "==> DONE."
echo "Jalankan ulang dev server: npm run dev"
echo "Buka: http://localhost:3000  (otomatis redirect ke /login UI baru)"
