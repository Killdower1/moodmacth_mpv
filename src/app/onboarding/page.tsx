"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<"" | "female" | "male" | "other">("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birthdate, gender }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setErr("Silakan login dulu.");
        return;
      }
      if (!data?.ok) {
        // tetap lanjut, tapi kasih info kecil
        console.warn("Onboarding partial:", data);
      }
      router.push("/mood");
    } catch (e: any) {
      setErr(e?.message ?? "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-[#FFCD00]" />
          <div>
            <h1 className="text-lg font-extrabold text-white">Lengkapi Profil</h1>
            <p className="text-sm text-white/60">Biar match-mu lebih akurat ✨</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-white/80">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="Nama panggilan"
              className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none placeholder:text-white/40 focus:border-[#FFCD00]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-white/80">Tanggal lahir</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e)=>setBirthdate(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none focus:border-[#FFCD00]"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-white/80">Gender</label>
              <select
                value={gender}
                onChange={(e)=>setGender(e.target.value as any)}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none focus:border-[#FFCD00]"
              >
                <option value="">Pilih</option>
                <option value="female">Perempuan</option>
                <option value="male">Laki-laki</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
          </div>

          {err && <p className="text-red-400 text-sm">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#FFCD00] text-black font-extrabold py-3 hover:opacity-90 disabled:opacity-60 transition"
          >
            {loading ? "Menyimpan..." : "Simpan & Lanjut"}
          </button>
        </form>

        <p className="text-xs text-white/50 mt-4">
          Dengan melanjutkan, kamu setuju pada Ketentuan & Kebijakan kami.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="h-2 w-8 rounded-full bg-[#FFCD00]" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
      </div>
    </div>
  );
}
