"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/feed",
    });
    if (res?.error) {
      setError("Email atau password salah");
      setLoading(false);
      return;
    }
    router.push("/feed");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <input name="email" className="w-full border rounded-lg p-3" placeholder="email@example.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input name="password" className="w-full border rounded-lg p-3" placeholder="••••••••" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-lg p-3 bg-black text-white disabled:opacity-50">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
