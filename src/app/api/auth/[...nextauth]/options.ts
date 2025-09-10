import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/server/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const code = (credentials?.code || "").trim();
        if (!email) return null;

        const devCode = process.env.DEV_STATIC_OTP || "000000";
        if (code && code !== devCode) return null;

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email },
        });
        return { id: user.id, email: user.email, name: user.name || user.email } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id as string;
      return session;
    },
  },
};
