"use client";
import ThemeToggle from "@/components/ThemeToggle";
import { LogOut, Bell, MapPin } from "lucide-react";
import { useState } from "react";

export default function SettingsPage(){
  const [dist, setDist] = useState(10);

  return (
    <div className="mobile-shell with-tabbar">
      <div className="mobile-card">
        <h1 className="h1" style={{marginBottom:12}}>Pengaturan</h1>

        <div className="card soft">
          <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <Bell size={16}/> Notifikasi
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span/>
            </label>
          </div>
        </div>

        <div className="card soft">
          <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <MapPin size={16}/> Radius (km)
            </div>
            <b>{dist}</b>
          </div>
          <input type="range" min={1} max={50} value={dist} onChange={e=>setDist(parseInt(e.target.value))}/>
        </div>

        <div className="card soft" style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>Tema</div>
          <ThemeToggle/>
        </div>

        <button className="btn ghost" style={{marginTop:8}}><LogOut/> Keluar</button>
      </div>
    </div>
  );
}