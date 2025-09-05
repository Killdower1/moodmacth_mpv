'use client';
import { useState } from 'react';

export default function Onboarding() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [photo, setPhoto] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="card" style={{maxWidth:560}}>
      <h2>Onboarding</h2>
      <p>Lengkapi profil dulu ya.</p>
      {err && <div className="badge" style={{borderColor:'#a33', color:'#fbb'}}>{err}</div>}
      <form onSubmit={async (e)=>{
        e.preventDefault();
        setSaving(true); setErr(null);
        const fd = new FormData();
        fd.set('name', name);
        fd.set('dob', dob);
        fd.set('gender', gender);
        fd.set('photo', photo);
        fd.set('bio', bio);
        const res = await fetch('/api/onboarding', { method:'POST', body: fd });
        setSaving(false);
        if (!res.ok) {
          const j = await res.json().catch(()=>({error:'Failed'}));
          setErr(j.error || 'Gagal menyimpan');
          return;
        }
        window.location.href = '/feed';
      }} className="grid">
        <input className="input" placeholder="Nama" value={name} onChange={e=>setName(e.target.value)} required />
        <input className="input" type="date" value={dob} onChange={e=>setDob(e.target.value)} required />
        <select className="select" value={gender} onChange={e=>setGender(e.target.value)} required>
          <option value="">Pilih gender</option>
          <option value="F">Female</option>
          <option value="M">Male</option>
          <option value="O">Other</option>
        </select>
        <input className="input" placeholder="URL Foto (sementara pakai link)" value={photo} onChange={e=>setPhoto(e.target.value)} required />
        <textarea className="input" placeholder="Bio singkat" value={bio} onChange={e=>setBio(e.target.value)} />
        <button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save & Start'}</button>
      </form>
    </div>
  );
}
