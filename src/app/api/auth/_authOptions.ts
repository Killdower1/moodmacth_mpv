import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const whitelist = (process.env.TEST_OTP_WHITELIST ?? "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Dev OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(creds) {
        const email = (creds?.email ?? "").toLowerCase();
        const otp = (creds?.otp ?? "");
        if (otp === "111111" && whitelist.includes(email)) {
          return { id: email, name: email, email };
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
      if ((token as any)?.userId) (session as any).userId = (token as any).userId;
      return session;
    },
  },
};
