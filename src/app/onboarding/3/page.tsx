"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Cigarette, Wine, Check, ArrowRight, SkipForward } from "lucide-react";

const T = ["YES","NO","PREFER_NOT"] as const;

function Chip({active,label,onClick}:{active:boolean;label:string;onClick:()=>void}){
  return (
    <button type="button" onClick={onClick} className={`chip ${active?"active":""}`}>
      {label}
      {active && <Check size={16} style={{marginLeft:6}}/>}
    </button>
  );
}

export default function Onboarding3Page(){
  const r = useRouter();
  const [smoking,setSmoking] = useState<string>("");
  const [alcohol,setAlcohol] = useState<string>("");
  const [catalog,setCatalog] = useState<string[]>([]);
  const [chosen,setChosen] = useState<string[]>([]);
  const [busy,setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/interests").then(r=>r.json()).then(j=>setCatalog(j.items||[]));
  }, []);

  function toggleInterest(x:string){
    setChosen(prev => prev.includes(x) ? prev.filter(i=>i!==x) : [...prev, x]);
  }

  async function submit(skip=false){
    setBusy(true);
    const res = await fetch("/api/onboarding/3",{
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify(skip ? { skip:true } : {
        smoking: smoking || null,
        alcohol: alcohol || null,
        interests: chosen
      })
    });
    const j = await res.json().catch(()=>null);
    setBusy(false);
    if (res.ok && j?.next) r.push(j.next);
    else alert(j?.error || "Gagal simpan");
  }

  return (
    <>
      <ThemeToggle />
      <div className="mobile-shell">
        <div className="mobile-card">
          <h1 className="h1" style={{marginBottom:6}}>Preferensi Tambahan</h1>
          <p className="sub" style={{marginBottom:12}}>Opsional aja. Bisa skip.</p>

          <div className="stack">
            <div>
              <div className="sub" style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <Cigarette size={16}/> Merokok
              </div>
              <div className="chips">
                {T.map(t => <Chip key={t} label={t} active={smoking===t} onClick={()=>setSmoking(t)} />)}
              </div>
            </div>

            <div>
              <div className="sub" style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <Wine size={16}/> Alkohol
              </div>
              <div className="chips">
                {T.map(t => <Chip key={t} label={t} active={alcohol===t} onClick={()=>setAlcohol(t)} />)}
              </div>
            </div>

            <div>
              <div className="sub" style={{marginBottom:8}}>Interests</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {catalog.map(item=>(
                  <button
                    key={item}
                    type="button"
                    onClick={()=>toggleInterest(item)}
                    className="btn"
                    style={{
                      borderColor: chosen.includes(item) ? "var(--primary)" : "var(--border)",
                      background: chosen.includes(item) ? "var(--chip-bg)" : "transparent"
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="row" style={{marginTop:6}}>
              <button className="btn" type="button" onClick={()=>submit(true)}>
                <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
                  Skip <SkipForward size={16}/>
                </span>
              </button>
              <button className="btn primary" disabled={busy} onClick={()=>submit(false)}>
                <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
                  Selesai <ArrowRight size={18}/>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}