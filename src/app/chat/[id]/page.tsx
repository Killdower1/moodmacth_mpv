"use client";
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/lib/useSocket";
import { useSession } from "next-auth/react";
import { toIntId } from "@/lib/id";

export default function Page({ params }: { params: { id: string } }) {
  const id = toIntId(params.id);
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const socketRef = useSocket(String(id));
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/conversations/${id}/messages`).then(r => r.json());
      setMessages(res.items || []);
    }
    load();
  }, [id]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const handler = (m: any) => {
      setMessages(prev => [...prev, m]);
    };
    s.on("message", handler);
    return () => {
      s.off("message", handler);
    };
  }, [socketRef]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim()) return;
    await fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
  }

  const meId = session?.user?.id ? toIntId(session.user.id) : undefined;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`max-w-xs px-3 py-2 rounded-lg ${m.senderId === meId ? 'bg-blue-600 ml-auto' : 'bg-gray-700 mr-auto'}`}>{m.text}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Say something..."
        />
        <button onClick={send} className="px-4 py-2 bg-black text-white rounded">Send</button>
      </div>
    </div>
  );
}
