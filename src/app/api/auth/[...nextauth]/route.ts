import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const handler = NextAuth({
  // Tidak pakai adapter -> NextAuth tidak create/upsert user ke Prisma
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "App Credentials",
      credentials: {
        email: { label: "Email/Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(c) {
        const email = c?.email as string | undefined;
        const password = c?.password as string | undefined;
        if (!email || !password) return null;

        // Verifikasi user yang SUDAH ada (email ATAU username)
        const user = await prisma.user.findFirst({
          where: { OR: [{ email: email }, { username: email }] },
        });
        if (!user) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email ?? null, name: user.name ?? null };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id as string;
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) (session as any).uid = token.sub;
      return session;
    },
  },
});
export { handler as GET, handler as POST };