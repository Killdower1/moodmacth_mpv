"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage(){
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [loading, setL] = useState(false);

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setL(true);
    try{
      const res = await fetch("/api/auth/login", {
        method:"POST",
        headers:{ "content-type":"application/json" },
        body: JSON.stringify({ email, password })
      });
      const j = await res.json().catch(()=>null);
      setL(false);
      if (res.ok && j?.next) r.push(j.next);
      else alert(j?.error || "Login gagal");
    }catch(err:any){
      setL(false); alert(err?.message || "Network error");
    }
  }

  return (
    <>
      <ThemeToggle />
      <div className="mobile-shell">
        <div className="mobile-card">
          <h1 className="h1" style={{marginBottom:6}}>Masuk</h1>
          <p className="sub" style={{marginBottom:14}}>Email/username & password → OTP → Home</p>
          <form className="stack" onSubmit={submit}>
            <div className="input">
              <Mail size={18} />
              <input placeholder="Email atau Username" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="input">
              <Lock size={18} />
              <input type="password" placeholder="Password" value={password} onChange={e=>setPwd(e.target.value)} />
            </div>
            <button className="btn primary" disabled={loading || !email || !password}>
              {loading ? "Memproses..." : (<span style={{display:"inline-flex",alignItems:"center",gap:8}}>
                <LogIn size={18}/> Masuk
              </span>)}
            </button>
            <button type="button" className="btn" onClick={()=>r.push("/register")}>
              Belum punya akun? Daftar
            </button>
          </form>
        </div>
      </div>
    </>
  );
}