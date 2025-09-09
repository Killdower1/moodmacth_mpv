"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, otp, redirect: false });
    setLoading(false);
    if (res?.ok) router.replace("/");
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Login (Dev OTP)</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="email" type="email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="OTP (111111)" type="text"
               value={otp} onChange={e=>setOtp(e.target.value)} />
        {error && <p className="text-red-600 text-sm">Login gagal: {error}</p>}
        <button disabled={loading} className="w-full rounded p-2 border">
          {loading ? "Loading..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}
