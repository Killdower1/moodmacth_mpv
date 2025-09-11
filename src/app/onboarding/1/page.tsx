"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Calendar, Phone, Info, User, UserRound, Sparkles } from "lucide-react";

type GenderVal = "male" | "female" | "other" | "";

function GenderChip({
  active, label, onClick, icon: Icon
}: { active:boolean; label:string; onClick:()=>void; icon:any }) {
  return (
    <button type="button" onClick={onClick} className={`chip ${active ? "active":""}`}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

export default function Onboarding1Page() {
  const r = useRouter();
  const [dateOfBirth, setDob] = useState("");
  const [gender, setGender] = useState<GenderVal>("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setL] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setL(true);
    try {
      const res = await fetch("/api/onboarding/1", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dateOfBirth, gender: gender || undefined, bio, phone }),
      });
      const j = await res.json().catch(() => null);
      setL(false);
      if (res.ok && j?.ok) r.push(j.next || "/onboarding/2");
      else alert(j?.error || `Gagal menyimpan (status ${res.status})`);
    } catch (e:any) {
      setL(false); alert(e?.message || "Network error");
    }
  }

  return (
    <>
      <ThemeToggle />
      <div className="mobile-shell">
        <div className="mobile-card">
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
            <div style={{width:8,height:8,borderRadius:999,background:"var(--primary)"}} />
            <div style={{width:8,height:8,borderRadius:999,background:"var(--border)"}} />
            <div style={{width:8,height:8,borderRadius:999,background:"var(--border)"}} />
            <span style={{marginLeft:8, color:"var(--muted)", fontSize:12}}>Step 1 dari 3</span>
          </div>

          <h1 className="h1" style={{display:"flex",alignItems:"center",gap:8}}>
            <Sparkles size={20}/> Yuk kenalan dulu ✨
          </h1>
          <p className="sub">Isi data dasar kamu. Gaya gen Z, tapi tetap aman 😉</p>

          <form className="stack" onSubmit={submit}>
            {/* Tanggal lahir */}
            <div className="input">
              <Calendar size={18} />
              <input type="date" value={dateOfBirth} onChange={e=>setDob(e.target.value)} />
            </div>

            {/* Gender */}
            <div className="chips">
              <GenderChip active={gender==="male"}   label="Male"   icon={User}      onClick={()=>setGender("male")} />
              <GenderChip active={gender==="female"} label="Female" icon={UserRound} onClick={()=>setGender("female")} />
              <GenderChip active={gender==="other"}  label="Other"  icon={Sparkles}  onClick={()=>setGender("other")} />
            </div>

            {/* Bio */}
            <div className="input" style={{padding:0}}>
              <div style={{display:"flex", alignItems:"start", gap:10, padding:"12px 14px"}}>
                <Info size={18} />
                <textarea rows={3} placeholder="Ceritain singkat tentang kamu…" value={bio} onChange={e=>setBio(e.target.value)} />
              </div>
            </div>

            {/* Phone */}
            <div className="input">
              <Phone size={18} />
              <input inputMode="tel" placeholder="0812xxxxxxx atau +62812xxxxxxx" value={phone} onChange={e=>setPhone(e.target.value)} />
            </div>

            <div className="row" style={{marginTop:6}}>
              <button className="btn ghost" type="button" onClick={()=>r.push("/login")}>Kembali</button>
              <button className="btn primary" disabled={loading || !phone}>
                {loading ? "Menyimpan..." : "Lanjut"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}