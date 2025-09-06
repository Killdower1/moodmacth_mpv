import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const schema = z.object({
          identifier: z.string().min(1),
          password: z.string().min(6),
        });
        const parsed = schema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }
        const { identifier, password } = parsed.data;
        const where = identifier.includes("@")
          ? { email: identifier.toLowerCase() }
          : { username: identifier };
        const user = await prisma.user.findUnique({ where });
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return {
          id: user.id.toString(),
          email: user.email,
          username: user.username,
          role: user.role,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        if ((user as any).role) token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string | undefined;
        if (token.role) session.user.role = token.role as string;
      }
      return session;
    },
  },
};
