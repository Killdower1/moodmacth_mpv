'use client';
import { useState } from 'react';

export default function MoodBar({ isAdult }: { isAdult: boolean }) {
  const [active, setActive] = useState<string | null>(null);

  async function join(mood: string) {
    if (mood === 'HOT' && !isAdult) {
      alert('HOT hanya untuk 18+');
      return;
    }
    setActive(mood);
    await fetch('/api/mood/join', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mood })
    });
  }

  const Btn = ({m}:{m:string}) => (
    <button
      className="btn"
      onClick={()=>join(m)}
      disabled={m==='HOT' && !isAdult}
      style={{opacity: active===m ? 1 : 0.9}}
    >
      {m}
    </button>
  );

  return (
    <div className="grid" style={{gridTemplateColumns:'repeat(4,minmax(0,1fr))', marginBottom:12}}>
      <Btn m="CHILL" />
      <Btn m="HAPPY" />
      <Btn m="FLIRTY" />
      <Btn m="HOT" />
    </div>
  );
}



