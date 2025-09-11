"use client";
import Image from "next/image";
import { MessageCircleMore } from "lucide-react";

const demo = [
  { id:"1", name:"Rina", last:"Lagi apa?" },
  { id:"2", name:"Bimo", last:"Gas ngopi besok" },
  { id:"3", name:"Dewi", last:"Haha iya bener" },
];

export default function MatchesPage(){
  return (
    <div className="mobile-shell with-tabbar">
      <div className="mobile-card">
        <h1 className="h1" style={{marginBottom:12}}>Matches</h1>
        <div className="list">
          {demo.map(x=>(
            <button key={x.id} className="list-item">
              <div className="avatar">
                <Image alt={x.name} src="/placeholder.png" width={40} height={40}/>
              </div>
              <div className="grow">
                <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
                  <b>{x.name}</b>
                  <MessageCircleMore size={18} />
                </div>
                <div className="muted">{x.last}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}