import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(6)
        });
        const parsed = schema.safeParse(credentials);
        if (!parsed.success) {
          console.log("Authorize: invalid input", credentials);
          return null;
        }
        const { email, password } = parsed.data;
        console.log("Authorize: mencari user dengan email", email);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
          console.log("Authorize: user not found", email);
          return null;
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        console.log("Authorize: compare result", valid);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.uid) session.user.id = token.uid as string;
      return session;
    },
  },
};
