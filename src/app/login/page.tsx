'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage(){
  const [email,setEmail]=useState('ceo@moodmacth.local');
  const [code,setCode]=useState('111111');
  const [loading,setLoading]=useState(false);
  return (
    <div className="card">
      <h2>Login (Test OTP Mode)</h2>
      <p>Whitelist & code: <span className="badge">111111</span></p>
      <div className="grid" style={{maxWidth:420}}>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Code" value={code} onChange={e=>setCode(e.target.value)} />
        <button className="btn" onClick={async()=>{
          setLoading(true);
          await signIn('credentials', { email, code, callbackUrl: '/feed' });
          setLoading(false);
        }}>{loading?'Signing in...':'Sign In'}</button>
      </div>
    </div>
  )
}
