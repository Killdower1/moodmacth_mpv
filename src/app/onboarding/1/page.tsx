"use client";
import { useEffect, useState } from "react";
type Gender = "male" | "female" | "other";
export default function Onboarding1() {
  const [name, setName] = useState(""); const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("male"); const [bio, setBio] = useState("");
  useEffect(() => { const s=sessionStorage.getItem("ob.1"); if(s)try{const o=JSON.parse(s); setName(o.name||""); setDob(o.dob||""); setGender(o.gender||"male"); setBio(o.bio||"");}catch{} }, []);
  const next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dob) return;
    sessionStorage.setItem("ob.1", JSON.stringify({ name, dob, gender, bio }));
    window.location.href = "/onboarding/2";
  };
  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold mb-4">Onboarding 1</h1>
      <form onSubmit={next} className="space-y-3">
        <input className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2" placeholder="Nama" value={name} onChange={e=>setName(e.target.value)} required/>
        <input className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2" type="date" value={dob} onChange={e=>setDob(e.target.value)} required/>
        <select className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2" value={gender} onChange={e=>setGender(e.target.value as Gender)}>
          <option value="male">Laki-laki</option><option value="female">Perempuan</option><option value="other">Lainnya</option>
        </select>
        <textarea className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2" placeholder="Bio singkat" rows={4} value={bio} onChange={e=>setBio(e.target.value)} />
        <button className="w-full rounded-lg bg-yellow-400 text-black font-semibold px-3 py-2">Lanjut</button>
      </form>
    </div>
  );
}
