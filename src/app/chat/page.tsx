"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type ChatItem = {
  id: string;
  match: { id: string; userAId: string; userBId: string; updatedAt: string };
  messages: { id: string; text: string | null; type: string; createdAt: string }[];
};

export default function ChatPage() {
  const [data, setData] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await fetch("/api/chats", { cache: "no-store" });
      const json = await res.json();
      if (mounted) { setData(json.chats ?? []); setLoading(false); }
    };
    load();
    const t = setInterval(load, 4000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Chat</h1>
      {loading ? <div>Loading…</div> : null}
      {!loading && data.length === 0 ? (
        <div className="text-sm text-gray-500">Belum ada chat. Lanjutkan swipe dulu ya.</div>
      ) : (
        <ul className="space-y-2">
          {data.map((c) => {
            const last = c.messages[0];
            return (
              <li key={c.id}>
                <Link href={`/chat/${c.id}`} className="block rounded-xl border p-3 hover:bg-gray-50">
                  <div className="text-base font-medium">Chat {c.id.slice(0, 8)}</div>
                  <div className="text-sm text-gray-500">
                    {last ? (last.text ?? `[${last.type}]`) : "Belum ada pesan"}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
