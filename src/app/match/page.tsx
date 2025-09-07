
import Link from "next/link";
import BumbleShell from "@/components/BumbleShell";
function fmtDate(d:string|Date){ return new Date(d).toLocaleString(); }
export default async function MatchPage(){
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/conversations`, { cache:"no-store" });
  const { items } = await res.json();
  return (
    <BumbleShell>
      <h1 className="text-xl font-bold mb-4">Matches</h1>
      <div className="space-y-3">
        {items?.length? items.map((c:any)=>(
          <Link key={c.id} href={`/chat/${c.id}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-white/10 shrink-0"><img src={c.peer.photo} alt={c.peer.name} className="h-full w-full object-cover"/></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium truncate">{c.peer.name} <span className="text-white/70">• {c.peer.age}</span></p>
                <span className="text-xs text-white/50">{fmtDate(c.lastAt)}</span>
              </div>
              <p className="text-sm text-white/70 truncate">{c.lastMessage || "Say hi 👋"}</p>
            </div>
          </Link>
        )):(<p className="text-white/60">Belum ada match. Coba swipe dulu di Feed.</p>)}
      </div>
    </BumbleShell>
  );
}
