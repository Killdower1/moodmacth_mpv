'use client';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type Message = { id: string; fromUser: string; content: string; createdAt: string };

export default function MessagesList({ matchId, meId }: { matchId: string; meId: string }) {
  const [items, setItems] = useState<Message[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;

    async function loadInitial() {
      const res = await fetch(`/api/chat?matchId=${matchId}`, { cache: 'no-store' });
      const data = await res.json();
      if (alive) {
        setItems(data.items ?? []);
        requestAnimationFrame(() => {
          if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
        });
      }
    }

    loadInitial();

    const socket: Socket = io({ path: '/api/socket/io' });
    const room = `match:${matchId}`;
    socket.emit('join', room);
    socket.on('message', (m: Message) => {
      setItems(prev => {
        if (prev.some(x => x.id === m.id)) return prev;
        const next = [...prev, m];
        requestAnimationFrame(() => {
          if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
        });
        return next;
      });
    });

    return () => { alive = false; socket.disconnect(); };
  }, [matchId]);

  async function reportMessage(id: string) {
    const reason = window.prompt('Alasan report pesan ini?');
    if (!reason) return;
    const fd = new FormData();
    fd.set('messageId', id);
    fd.set('reason', reason);
    const res = await fetch('/api/report', { method: 'POST', body: fd });
    if (res.ok) alert('Terima kasih, report diterima.');
    else alert('Gagal mengirim report.');
  }

  return (
    <div
      ref={boxRef}
      style={{ maxHeight: 400, overflow: 'auto', padding: 8, border: '1px solid #1f2a36', borderRadius: 8 }}
    >
      {items.map(m => (
        <div key={m.id} style={{ margin: '6px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="badge">{m.fromUser === meId ? 'You' : 'Them'}</div>
          <div style={{flex:1}}>{m.content}</div>
          <button className="btn" style={{padding:'2px 8px'}} onClick={()=>reportMessage(m.id)}>Report</button>
        </div>
      ))}
    </div>
  );
}



