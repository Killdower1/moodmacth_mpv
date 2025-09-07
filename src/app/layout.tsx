import "./globals.css";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";

export const metadata = {
  title: "Moodmatch",
  description: "Find your vibe",
};

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.className} bg-[#0b0f14] text-white min-h-screen`}>
        <main className="mx-auto max-w-md px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-md px-4 py-8 text-white/50 text-sm">
          © {new Date().getFullYear()} Moodmatch
        </footer>
      </body>
    </html>
  );
}
