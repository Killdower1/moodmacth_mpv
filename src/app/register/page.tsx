"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, name }) });
    setLoading(false);
    if (res.ok) router.push("/login"); else { const data = await res.json(); alert(data?.error || "Register failed"); }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        <input className="w-full border rounded-lg p-3" placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="w-full border rounded-lg p-3" placeholder="email@example.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border rounded-lg p-3" placeholder="••••••••" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-lg p-3 bg-black text-white disabled:opacity-50">
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
