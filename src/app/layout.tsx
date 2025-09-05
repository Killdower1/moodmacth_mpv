import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="grid grid-2" style={{alignItems:'center'}}>
            <div><Link href="/"><h1 style={{margin:0}}>Moodmacth</h1></Link></div>
            <nav style={{textAlign:'right'}}>
              {session ? (
                <Link className="btn" href="/me">My Profile</Link>
              ) : (
                <Link className="btn" href="/login">Login</Link>
              )}
            </nav>
          </header>
          <main style={{marginTop:16}}>{children}</main>
          <footer style={{marginTop:32, opacity:0.6}}>© {new Date().getFullYear()} Moodmacth</footer>
        </div>
      </body>
    </html>
  );
}
