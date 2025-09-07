'use client';
import { useState } from 'react';

export default function SendMessageForm({ matchId }: { matchId: string }) {
  const [pending, setPending] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setPending(true);
        await fetch('/api/chat', { method: 'POST', body: fd });
        setPending(false);
        (e.target as HTMLFormElement).reset();
      }}
      style={{ marginTop: 8, display: 'flex', gap: 8 }}
    >
      <input className="input" name="content" placeholder="Type a message..." required />
      <input type="hidden" name="matchId" value={matchId} />
      <button className="btn" disabled={pending}>{pending ? 'Sending...' : 'Send'}</button>
    </form>
  );
}



