
import Link from "next/link";

function fmtDate(d: string | Date) {
  const dt = new Date(d);
  return dt.toLocaleString();
}

export default async function MatchPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/conversations`, { cache: "no-store" });
  const { items } = await res.json();

  return (
    <main className="min-h-screen bg-[#0b0f14]">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <h1 className="text-2xl font-semibold mb-4">Matches</h1>

        <div className="space-y-3">
          {items?.length ? items.map((c: any) => (
            <Link key={c.id} href={`/chat/${c.id}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-3">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-white/10 shrink-0">
                <img src={c.peer.photo} alt={c.peer.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium truncate">{c.peer.name}</p>
                  <span className="text-xs text-white/50">{fmtDate(c.lastAt)}</span>
                </div>
                <p className="text-sm text-white/70 truncate">{c.lastMessage || "Say hi 👋"}</p>
              </div>
            </Link>
          )) : (
            <p className="text-white/60">Belum ada match. Coba swipe dulu di Feed.</p>
          )}
        </div>
      </div>
    </main>
  );
}
