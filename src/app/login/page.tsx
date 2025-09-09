"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { UseShell } from "../_auth/shell";

export default function Page() {
  const [email,setEmail]=useState("");
  const [otp,setOtp]=useState("");
  const [loading,setLoading]=useState(false);
  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setLoading(true);
    const res = await signIn("credentials", { email, otp, redirect: true, callbackUrl: "/" }).catch(()=>null);
    setLoading(false);
    if (!res) alert("Login gagal. Cek email/OTP.");
  }
  return (
    <UseShell>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Masuk</h1>
        <p className="text-slate-400 text-sm">Gunakan email yang di-whitelist + OTP <code>111111</code></p>
      </div>
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur p-5 shadow-xl space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-3 py-2 outline-none focus:border-slate-500"
                 type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/>
        </div>
        <div>
          <label className="block text-sm mb-1">OTP</label>
          <input className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-3 py-2 outline-none focus:border-slate-500 tracking-[0.3em]"
                 type="text" inputMode="numeric" value={otp} onChange={e=>setOtp(e.target.value)} required placeholder="••••••"/>
        </div>
        <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2 font-medium shadow-lg disabled:opacity-60">
          {loading ? "Signing in..." : "Masuk"}
        </button>
        <p className="text-center text-sm text-slate-400">Belum punya akun? <Link className="underline underline-offset-4" href="/register">Daftar</Link></p>
      </form>
    </UseShell>
  );
}
