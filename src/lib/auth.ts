"use server";

import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or name", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { }
            ]
          }
        });
        if (!user) return null;

        // Sesuaikan field hash di DB kamu (passwordHash / password)
        const hash = (user as any).passwordHash ?? (user as any).password ?? "";
        const ok = await bcrypt.compare(credentials.password, hash);
        if (!ok) return null;

        return {
          id: String((user as any).id),
          email: (user as any).email ?? null,
          name: (user as any).name ?? null,
          } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id ?? (token as any).id;
        (token as any).name = (user as any).name ?? (token as any).name;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = (token as any).id ?? null;
      (session.user as any).name = (token as any).name ?? null;
      return session;
    }
  },
  pages: { signIn: "/login" }
};