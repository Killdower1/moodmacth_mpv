"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { ShieldCheck, TimerReset, ArrowRight } from "lucide-react";

export default function VerifyOtpPage(){
  const r = useRouter();
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(30);
  const [loading, setL] = useState(false);

  useEffect(()=>{ const t=setInterval(()=>setLeft(s=>s>0?s-1:0),1000); return ()=>clearInterval(t); },[]);

  async function submit(e?:React.FormEvent){
    e?.preventDefault();
    if (code.length !== 6) return alert("Kode OTP 6 digit");
    setL(true);
    try{
      const res = await fetch("/api/auth/verify-otp",{
        method:"POST", headers:{ "content-type":"application/json" },
        body: JSON.stringify({ code })
      });
      const j = await res.json().catch(()=>null);
      setL(false);
      if (res.ok && j?.next) r.push(j.next);
      else alert(j?.error || "Kode OTP salah/expired");
    }catch(err:any){
      setL(false); alert(err?.message || "Network error");
    }
  }

  async function resend(){
    if (left>0) return;
    setLeft(30);
    await fetch("/api/auth/resend-otp",{ method:"POST" }).catch(()=>{});
  }

  return (
    <>
      <ThemeToggle />
      <div className="mobile-shell">
        <div className="mobile-card">
          <h1 className="h1" style={{display:"flex",alignItems:"center",gap:8}}>
            <ShieldCheck size={20}/> Verifikasi OTP
          </h1>
          <p className="sub">Masukkan 6 digit kode yang kami kirim.</p>

          <form className="stack otp-one" onSubmit={submit}>
            <input
              className="otp-one-input"
              inputMode="numeric"
              autoFocus
              placeholder="••••••"
              value={code}
              onChange={(e)=>{
                const v = e.target.value.replace(/\D/g,"").slice(0,6);
                setCode(v);
                if (v.length === 6) setTimeout(()=>submit(), 0);
              }}
            />

            <div className="otp-helpers">
              <button type="button" className="btn ghost" onClick={()=>history.back()}>Kembali</button>
              <button
                type="button"
                className="btn otp-resend"
                disabled={left>0}
                onClick={resend}
                title={left>0?`Tunggu ${left}s`:"Kirim ulang"}
              >
                <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
                  <TimerReset size={16}/> {left>0?`Kirim ulang (${left}s)`:"Kirim ulang"}
                </span>
              </button>
            </div>

            <button className="btn primary" disabled={loading || code.length!==6}>
              <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
                Lanjut <ArrowRight size={18}/>
              </span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}