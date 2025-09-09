"use client";
import { useState } from "react";
import Link from "next/link";
import { UseShell } from "../_auth/shell";

export default function Page() {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState<string|null>(null);
  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setMsg(null);
    if (password!==confirm) { setMsg("Password & konfirmasi tidak sama"); return; }
    setLoading(true);
    try{
      const res = await fetch("/api/auth/register",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({name,email,password})});
      const data = await res.json().catch(()=> ({}));
      if (!res.ok) throw new Error(data?.message || "Register gagal");
      setMsg("Berhasil! Silakan login.");
    }catch(err:any){ setMsg(err?.message||"Register gagal"); }
    finally{ setLoading(false); }
  }
  return (
    <UseShell>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Daftar</h1>
        <p className="text-slate-400 text-sm">Buat akun baru untuk mulai</p>
      </div>
      {msg && <div className="mb-4 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm">{msg}</div>}
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur p-5 shadow-xl space-y-4">
        <div>
          <label className="block text-sm mb-1">Nama</label>
          <input className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-3 py-2 outline-none focus:border-slate-500"
                 type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="Nama kamu"/>
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-3 py-2 outline-none focus:border-slate-500"
                 type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-3 py-2 outline-none focus:border-slate-500"
                   type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"/>
          </div>
          <div>
            <label className="block text-sm mb-1">Konfirmasi</label>
            <input className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-3 py-2 outline-none focus:border-slate-500"
                   type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required placeholder="••••••••"/>
          </div>
        </div>
        <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 font-medium shadow-lg disabled:opacity-60">
          {loading ? "Mendaftar…" : "Daftar"}
        </button>
        <p className="text-center text-sm text-slate-400">Sudah punya akun? <Link className="underline underline-offset-4" href="/login">Masuk</Link></p>
      </form>
    </UseShell>
  );
}
