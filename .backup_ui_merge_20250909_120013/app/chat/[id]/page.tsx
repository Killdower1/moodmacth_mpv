
import dynamic from "next/dynamic";
import BumbleShell from "@/components/BumbleShell";
const ChatClient = dynamic(()=>import("./room-client"), { ssr:false });
export default function ChatPage({ params }:{ params:{ id:string }}){
  return (<BumbleShell><ChatClient idParam={params.id}/></BumbleShell>);
}
