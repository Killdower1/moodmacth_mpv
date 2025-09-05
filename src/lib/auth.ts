import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const TEST_OTP_MODE = process.env.TEST_OTP_MODE === 'true';
const WHITELIST = (process.env.TEST_OTP_WHITELIST || '').split(',').map(s=>s.trim()).filter(Boolean);

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: "Test OTP",
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "Code", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email.toLowerCase();
        if (!TEST_OTP_MODE) return null;
        if (!WHITELIST.includes(email)) return null;
        if (credentials.code !== '111111') return null;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({ data: { email } });
        }
        return { id: user.id, email: user.email, name: user.name || user.email };
      }
    })
  ],
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET
};
