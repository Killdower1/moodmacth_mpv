"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, code, redirect: false });
    setLoading(false);
    if (res?.ok) window.location.href = "/onboarding";
    else alert("Login failed");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-6 space-y-3">
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" className="border px-3 py-2 w-full" />
      <input value={code} onChange={e=>setCode(e.target.value)} placeholder="OTP (dev: 000000)" className="border px-3 py-2 w-full" />
      <button disabled={loading} className="px-4 py-2 border rounded">{loading? "Loading...":"Login"}</button>
    </form>
  );
}