"use client";
import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  senderId: string;
  text: string | null;
  createdAt: string;
};

type ConsentMine = { allowPhoto:boolean; allowLocation:boolean; allowVideoCall:boolean; allowVoiceCall:boolean } | null;

export default function ChatDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [allowed, setAllowed] = useState({photo:false,location:false,videoCall:false,voiceCall:false});
  const [mine, setMine] = useState<ConsentMine>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const [mRes, cRes] = await Promise.all([
      fetch(`/api/chats/${id}/messages`, { cache: "no-store" }),
      fetch(`/api/chats/${id}/consent`, { cache: "no-store" }),
    ]);
    const mJson = mRes.ok ? await mRes.json() : { messages: [], me: null };
    const cJson = cRes.ok ? await cRes.json() : { allowed: {photo:false,location:false,videoCall:false,voiceCall:false}, mine: null };
    setMessages(mJson.messages ?? []); setMe(mJson.me ?? null);
    setAllowed(cJson.allowed ?? {photo:false,location:false,videoCall:false,voiceCall:false});
    setMine(cJson.mine ?? null);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await load(); })();
    const t = setInterval(load, 3000);
    return () => { mounted = false; clearInterval(t); };
  }, [id]);

  const send = async () => {
    const body = { text };
    setText("");
    await fetch(`/api/chats/${id}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    await load();
  };

  const toggleConsent = async (key: keyof NonNullable<ConsentMine>) => {
    const next = { ...(mine ?? { allowPhoto:false,allowLocation:false,allowVideoCall:false,allowVoiceCall:false }), [key]: !(mine?.[key] ?? false) };
    setMine(next);
    await fetch(`/api/chats/${id}/consent`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
    await load();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <h1 className="text-xl font-semibold flex-1">Chat {id.slice(0,8)}</h1>
        <div className="flex gap-2 text-xs">
          <button className={`px-2 py-1 rounded border ${mine?.allowPhoto ? "bg-black text-white" : ""}`} onClick={() => toggleConsent("allowPhoto")}>Photo {allowed.photo ? "✅" : "❌"}</button>
          <button className={`px-2 py-1 rounded border ${mine?.allowLocation ? "bg-black text-white" : ""}`} onClick={() => toggleConsent("allowLocation")}>Location {allowed.location ? "✅" : "❌"}</button>
          <button className={`px-2 py-1 rounded border ${mine?.allowVideoCall ? "bg-black text-white" : ""}`} onClick={() => toggleConsent("allowVideoCall")}>Video {allowed.videoCall ? "✅" : "❌"}</button>
          <button className={`px-2 py-1 rounded border ${mine?.allowVoiceCall ? "bg-black text-white" : ""}`} onClick={() => toggleConsent("allowVoiceCall")}>Voice {allowed.voiceCall ? "✅" : "❌"}</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border rounded-xl p-3 bg-white">
        {messages.map((m) => {
          const mineMsg = m.senderId === me;
          return (
            <div key={m.id} className={`mb-2 flex ${mineMsg ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-3 py-2 ${mineMsg ? "bg-black text-white" : "bg-gray-100"}`}>
                {m.text ?? ""}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { send(); } }} placeholder="Tulis pesan…" className="flex-1 border rounded-xl px-3 py-2" />
        <button disabled={!text.trim()} onClick={send} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50">Kirim</button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Fitur aktif: Photo {allowed.photo ? "✅" : "❌"} · Location {allowed.location ? "✅" : "❌"} · Video {allowed.videoCall ? "✅" : "❌"} · Voice {allowed.voiceCall ? "✅" : "❌"}
      </div>
    </div>
  );
}