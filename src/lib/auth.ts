import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const schema = z.object({
          identifier: z.string().min(3),
          password: z.string().min(6)
        });
        const parsed = schema.safeParse(credentials);
        if (!parsed.success) return null;
        const identifier = parsed.data.identifier.trim().toLowerCase();
        const password = parsed.data.password;
        const where =
          identifier.includes("@")
            ? { email: identifier }
            : { username: identifier };
        const user = await prisma.user.findUnique({ where });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return {
          id: String(user.id),
          email: user.email,
          username: user.username,
          name: user.name ?? "",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
        token.email = user.email;
        token.username = user.username;
        token.name = user.name ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.username = token.username;
        session.user.name = token.name;
      }
      return session;
    },
  },
};
