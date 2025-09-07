
import dynamic from "next/dynamic";
import BumbleShell from "@/components/BumbleShell";
const SwipeDeck = dynamic(()=>import("@/components/SwipeDeck"), { ssr:false });
export default function FeedPage(){
  return (<BumbleShell><SwipeDeck/></BumbleShell>);
}

