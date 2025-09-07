
import { Nunito } from "next/font/google";
import Link from "next/link";
const nunito = Nunito({ subsets: ["latin"], weight: ["400","600","700"] });
export default function BumbleShell({ children }: { children: React.ReactNode }){
  return (
    <div className={nunito.className + " min-h-screen bg-[#0b0f14] text-white"}>
      <header className="sticky top-0 z-20 bg-[#FFCD00] text-black">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <Link href="/feed" className="font-extrabold tracking-wide">moodmatch</Link>
          <nav className="text-sm flex gap-3">
            <Link href="/mood" className="hover:underline">Mood</Link>
            <Link href="/match" className="hover:underline">Matches</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-5">{children}</main>
    </div>
  );
}
