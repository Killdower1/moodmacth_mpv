"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { ImagePlus, Star, ArrowRight } from "lucide-react";

type P = { id:string; url:string; isPrimary:boolean };

export default function Onboarding2Page() {
  const r = useRouter();
  const [photos, setPhotos] = useState<P[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/onboarding/2/list");
    const j = await res.json();
    if (res.ok) setPhotos(j.photos ?? []);
  }
  useEffect(() => { load(); }, []);

  async function uploadFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("file", f));
    const res = await fetch("/api/onboarding/2/upload", { method: "POST", body: fd });
    setBusy(false);
    if (res.ok) load(); else { const j = await res.json().catch(()=>null); alert(j?.error || "Upload gagal"); }
  }

  async function setPrimary(id: string) {
    setBusy(true);
    const res = await fetch("/api/onboarding/2/primary", {
      method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ photoId: id })
    });
    setBusy(false);
    if (res.ok) load(); else alert("Gagal set utama");
  }

  async function next() {
    const res = await fetch("/api/onboarding/2/complete", { method:"POST" });
    const j = await res.json().catch(()=>null);
    if (res.ok && j?.next) r.push(j.next);
    else alert(j?.error || "Lengkapi dulu");
  }

  return (
    <>
      <ThemeToggle />
      <div className="mobile-shell">
        <div className="mobile-card">
          <h1 className="h1" style={{marginBottom:6}}>Tambah Foto</h1>
          <p className="sub" style={{marginBottom:12}}>Upload beberapa foto dan pilih satu jadi foto utama.</p>

          <div className="stack">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={e=>uploadFiles(e.target.files)}
              style={{display:"none"}}
            />
            <button className="btn" type="button" onClick={()=>fileRef.current?.click()}>
              <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
                <ImagePlus size={18}/> Tambah Foto
              </span>
            </button>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {photos.map(p => (
                <div key={p.id} style={{border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
                  <img src={p.url} alt="" style={{width:"100%",aspectRatio:"1/1",objectFit:"cover"}} />
                  <button
                    className="btn"
                    style={{width:"100%",borderTop:"1px solid var(--border)",borderRadius:0}}
                    onClick={()=>setPrimary(p.id)}
                    type="button"
                  >
                    <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
                      <Star size={16}/> {p.isPrimary ? "Foto Utama ✓" : "Jadikan Utama"}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            <button className="btn primary" disabled={busy} onClick={next}>
              <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
                Lanjut <ArrowRight size={18}/>
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}