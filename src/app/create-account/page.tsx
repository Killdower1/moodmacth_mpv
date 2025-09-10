"use client";
import { useState } from "react";
export default function CreateAccountPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [err, setErr] = useState<string|null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    if (!email.trim()) return setErr("Email wajib diisi.");
    if (pw.length < 6) return setErr("Password minimal 6 karakter.");
    if (pw !== cpw) return setErr("Konfirmasi password tidak sama.");
    sessionStorage.setItem("ob.account", JSON.stringify({ email: email.trim().toLowerCase(), password: pw }));
    window.location.href = "/onboarding/1";
  };
  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2" type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} required/>
        <input className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2" type="password" placeholder="Confirm Password" value={cpw} onChange={e=>setCpw(e.target.value)} required/>
        {err && <div className="text-sm text-red-500">{err}</div>}
        <button className="w-full rounded-lg bg-yellow-400 text-black font-semibold px-3 py-2">Lanjut</button>
      </form>
      <div className="mt-3 text-sm text-zinc-400">
        Sudah punya akun? <a className="text-yellow-400 underline" href="/login">Login</a>
      </div>
    </div>
  );
}
