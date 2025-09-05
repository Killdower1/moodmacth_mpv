"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    await signIn("credentials", { email, password, redirect: true, callbackUrl: "/feed" });
    setLoading(false);
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <input className="w-full border rounded-lg p-3" placeholder="email@example.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border rounded-lg p-3" placeholder="••••••••" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-lg p-3 bg-black text-white disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-center text-sm">Belum punya akun? <Link className="underline" href="/register">Sign up</Link></p>
      </form>
    </div>
  );
}
