import { DefaultSession } from "next-auth";

export * from "next-auth";
export { getServerSession } from "next-auth/next";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username?: string | null;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    username?: string | null;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username?: string | null;
    role?: string;
  }
}
