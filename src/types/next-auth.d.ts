import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string | null;
      name: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: number;
    username?: string | null;
  }

  interface JWT {
    id?: string;
    email?: string;
    username?: string | null;
    name?: string | null;
  }
}
