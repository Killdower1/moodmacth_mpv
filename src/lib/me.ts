
"use client";
export async function fetchMeId(): Promise<string | null>{
  try{ const r=await fetch('/api/me',{ cache:'no-store' }); if(!r.ok) return null; const j=await r.json(); return j?.id? String(j.id): null; }catch{ return null; }
}
