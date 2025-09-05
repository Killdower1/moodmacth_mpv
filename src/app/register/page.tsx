"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/feed",
    });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Register failed");
      setLoading(false);
      return;
    }

    // Jika sukses, langsung sign in pakai NextAuth Credentials
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/feed",
    });
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <input name="name" className="w-full border rounded-lg p-3" placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input name="email" className="w-full border rounded-lg p-3" placeholder="email@example.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input name="password" className="w-full border rounded-lg p-3" placeholder="••••••••" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-lg p-3 bg-black text-white disabled:opacity-50">
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
