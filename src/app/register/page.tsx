"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { User, Mail, Lock, Sparkles } from "lucide-react";

export default function RegisterPage(){
  const r = useRouter();
  const [username, setU] = useState("");
  const [email, setE] = useState("");
  const [password, setP] = useState("");
  const [loading, setL] = useState(false);

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setL(true);
    try{
      const res = await fetch("/api/auth/register", {
        method:"POST",
        headers:{ "content-type":"application/json" },
        body: JSON.stringify({ username, email: email || null, password })
      });
      const j = await res.json().catch(()=>null);
      setL(false);
      if (res.ok && j?.next) r.push(j.next);
      else alert(j?.error || "Register gagal");
    }catch(err:any){
      setL(false); alert(err?.message || "Network error");
    }
  }

  return (
    <>
      <ThemeToggle />
      <div className="mobile-shell">
        <div className="mobile-card">
          <h1 className="h1" style={{display:"flex",alignItems:"center",gap:8}}>
            <Sparkles size={20}/> Daftar
          </h1>
          <p className="sub">Bikin username & password dulu. Email opsional.</p>
          <form className="stack" onSubmit={submit}>
            <div className="input">
              <User size={18} />
              <input placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
            </div>
            <div className="input">
              <Mail size={18} />
              <input placeholder="Email (opsional)" value={email} onChange={e=>setE(e.target.value)} />
            </div>
            <div className="input">
              <Lock size={18} />
              <input type="password" placeholder="Password" value={password} onChange={e=>setP(e.target.value)} />
            </div>
            <button className="btn primary" disabled={loading || !username || !password}>
              {loading ? "Mendaftar..." : "Daftar & Lanjut"}
            </button>
            <button type="button" className="btn" onClick={()=>r.push("/login")}>Sudah punya akun? Masuk</button>
          </form>
        </div>
      </div>
    </>
  );
}