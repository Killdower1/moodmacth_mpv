import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { signIn } from "next-auth/react";

const handler = NextAuth(authOptions);

const handleLogin = async (e) => {
  e.preventDefault();
  await signIn("credentials", {
    email,
    password,
    redirect: true,
    callbackUrl: "/feed",
  });
};

export { handler as GET, handler as POST };
