import "./globals.css";
import { Nunito } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "Moodmatch",
  description: "Find your vibe"};

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.className} bg-[#0b0f14] text-white min-h-screen`}>
        <header className="sticky top-0 z-20 bg-[#FFCD00] text-black">
          <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
            <Link href="/feed" className="font-extrabold tracking-wide">moodmatch</Link>
            <nav className="text-sm flex gap-3">
              <Link href="/mood" className="hover:underline">Mood</Link>
              <Link href="/match" className="hover:underline">Matches</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-md px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-md px-4 py-8 text-white/50 text-sm">
          © {new Date().getFullYear()} Moodmatch
        </footer>
      </body>
    </html>
  );
}



