
"use client";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/lib/useSocket";
import { fetchMeId } from "@/lib/me";
type Msg = { id:any; conversationId:any; senderId:any; text:string; createdAt:string };
export default function ChatClient({ idParam }:{ idParam:string }){
  const [meId,setMeId]=useState<string|null>(null);
  const [messages,setMessages]=useState<Msg[]>([]);
  const [text,setText]=useState("");
  const [typingPeer,setTypingPeer]=useState(false);
  const typingTimer=useRef<any>(null);
  const listRef=useRef<HTMLDivElement>(null);
  const socketRef=useSocket(idParam);
  useEffect(()=>{ fetchMeId().then(setMeId); },[]);
  useEffect(()=>{ (async()=>{ const r=await fetch(`/api/conversations/${idParam}/messages`,{cache:'no-store'}); const d=await r.json(); setMessages(d.messages||[]); scrollBottom(); })(); },[idParam]);
  useEffect(()=>{ const s=socketRef.current; if(!s) return;
    const onMsg=(m:Msg)=>{ if(String(m.conversationId)!==String(idParam)) return; setMessages(p=>[...p,m]); scrollBottom(); };
    const onTyping=()=>{ setTypingPeer(true); if(typingTimer.current) clearTimeout(typingTimer.current); typingTimer.current=setTimeout(()=>setTypingPeer(false),1200); };
    s.on('message', onMsg); s.on('typing', onTyping); return ()=>{ s.off('message', onMsg); s.off('typing', onTyping); };
  },[idParam, socketRef]);
  function scrollBottom(){ requestAnimationFrame(()=>{ const el=listRef.current; if(el) el.scrollTop=el.scrollHeight; }); }
  async function send(){ const t=text.trim(); if(!t) return; setText("");
    const r=await fetch(`/api/conversations/${idParam}/messages`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:t })}); const d=await r.json(); const saved:Msg|undefined=d?.message; if(!saved) return;
    setMessages(prev=>[...prev, saved]); scrollBottom(); const s=socketRef.current; if(s) s.emit('broadcast', saved);
  }
  function onChange(v:string){ setText(v); const s=socketRef.current; if(s && meId) s.emit('typing', { conversationId:idParam, userId: meId }); }
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-white/10"/><h1 className="text-lg font-semibold">Chat</h1>
      </div>
      <div ref={listRef} className="h-[65vh] overflow-y-auto p-4 space-y-2">
        {messages.map((m)=>{ const mine=meId && String(m.senderId)===String(meId);
          return (<div key={m.id} className={mine? "flex justify-end":"flex justify-start"}>
            <div className={mine? "max-w-[75%] px-3 py-2 rounded-2xl bg-white text-black":"max-w-[75%] px-3 py-2 rounded-2xl bg-white/10 text-white"}>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              <p className={mine? "text-black/60 text-[10px] mt-1":"text-white/50 text-[10px] mt-1"}>{new Date(m.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>);
        })}
        {!messages.length && (<p className="text-white/60 text-sm">Mulai ngobrol—ketik pesan pertama kamu 👇</p>)}
        {typingPeer && (<div className="flex justify-start"><div className="px-3 py-2 rounded-2xl bg-white/10 text-white/70 text-xs">typing…</div></div>)}
      </div>
      <div className="p-3 border-t border-white/10 flex gap-2">
        <input value={text} onChange={e=>onChange(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Tulis pesan…" className="flex-1 rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:bg-white/15"/>
        <button onClick={send} className="bumble-cta">Send</button>
      </div>
    </div>
  );
}
