"use client";
import { useEffect, useState } from "react";
type Sel = { dataUrl: string };
export default function Onboarding2() {
  const [files, setFiles] = useState<Sel[]>([]);
  const [primary, setPrimary] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  useEffect(()=>{ const s=sessionStorage.getItem("ob.2"); if(s)try{const o=JSON.parse(s); setFiles(o.files||[]); setPrimary(o.primaryIndex||0);}catch{} },[]);
  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files; if (!list) return;
    const arr: Sel[] = [];
    for (let i=0;i<list.length;i++){ const f=list[i]; const url=await readAsDataURL(f); arr.push({ dataUrl:url }); }
    const merged=[...files,...arr]; setFiles(merged);
    sessionStorage.setItem("ob.2", JSON.stringify({ files: merged, primaryIndex: primary }));
  };
  const selectPrimary = (idx:number) => { setPrimary(idx); sessionStorage.setItem("ob.2", JSON.stringify({ files, primaryIndex: idx })); };
  const removeAt = (idx:number) => {
    const next = files.filter((_,i)=>i!==idx);
    const newPrimary = Math.max(0, Math.min(primary, next.length-1));
    setFiles(next); setPrimary(newPrimary);
    sessionStorage.setItem("ob.2", JSON.stringify({ files: next, primaryIndex: newPrimary }));
  };
  const finish = async () => {
    setSubmitting(true); setErr(null);
    try {
      const account = JSON.parse(sessionStorage.getItem("ob.account") || "{}");
      const ob1 = JSON.parse(sessionStorage.getItem("ob.1") || "{}");
      const ob2 = JSON.parse(sessionStorage.getItem("ob.2") || "{}");
      const res = await fetch("/api/auth/register-with-onboarding",{
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ account, ob1, ob2 })
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) setErr("Gagal menyimpan. Coba lagi.");
      else { sessionStorage.clear(); window.location.href="/home"; }
    } catch { setErr("Network error."); } finally { setSubmitting(false); }
  };
  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold mb-4">Onboarding 2</h1>
      <div className="mb-3">
        <input multiple type="file" accept="image/*" className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2" onChange={onFiles}/>
        <div className="mt-2 text-xs text-zinc-400">Upload beberapa foto, lalu pilih satu sebagai foto profil utama.</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {files.map((f, idx) => (
          <div key={idx} className="relative rounded-lg overflow-hidden border">
            <img src={f.dataUrl} alt={"photo-"+idx} className="h-28 w-full object-cover" />
            <div className="absolute top-1 right-1 flex gap-1">
              <button onClick={()=>removeAt(idx)} className="rounded bg-black/60 text-white text-xs px-2 py-0.5">Hapus</button>
              <button onClick={()=>selectPrimary(idx)} className={"rounded text-xs px-2 py-0.5 "+(idx===primary?"bg-yellow-400 text-black":"bg-black/60 text-white")}>
                {idx===primary?"Primary":"Pilih"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {err && <div className="mt-3 text-sm text-red-500">{err}</div>}
      <button disabled={submitting||files.length===0} onClick={finish} className="mt-4 w-full rounded-lg bg-yellow-400 text-black font-semibold px-3 py-2 disabled:opacity-60">
        {submitting ? "Menyimpan..." : "Selesai"}
      </button>
    </div>
  );
}
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const r=new FileReader(); r.onload=()=>resolve(String(r.result)); r.onerror=reject; r.readAsDataURL(file); });
}
