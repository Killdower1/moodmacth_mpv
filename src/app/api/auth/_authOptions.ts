import type { NextAuthOptions, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const whitelist = (process.env.TEST_OTP_WHITELIST ?? "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

// hash sederhana -> number stabil dari email
function hashToNumber(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  const n = Math.abs(h);
  return n === 0 ? 1 : n; // hindari 0
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Dev OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(creds, _req): Promise<User | null> {
        const email = (creds?.email ?? "").toLowerCase();
        const otp = (creds?.otp ?? "");
        if (otp === "111111" && whitelist.includes(email)) {
          const user: User = {
            id: hashToNumber(email), // <<< number, cocok dengan tipe kamu
            name: email,
            email,
          } as unknown as User;
          return user;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as any).userId = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if ((token as any)?.userId != null) (session as any).userId = (token as any).userId;
      return session;
    },
  },
};
