
import { prisma } from "@/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { toIntId } from "@/lib/id";
import { calcAge } from "@/lib/age";
export async function GET(){
  const s = await getServerSession(authOptions).catch(()=>null as any);
  if(!s?.user?.id) return new Response(JSON.stringify({ error:"unauthenticated" }), { status: 401 });
  const meId = toIntId(s.user.id);
    const convs = await prisma.conversation.findMany({
      where:{ OR:[{ userAId: meId }, { userBId: meId }] },
      orderBy:{ createdAt:"desc" },
      include:{
        messages:{ orderBy:{ createdAt:"desc" }, take:1 },
        userA:{ select:{ id:true, name:true, gender:true, birthdate:true, photos:true } },
        userB:{ select:{ id:true, name:true, gender:true, birthdate:true, photos:true } },
      },
    });
    const items = convs.map((c)=>{
      const peer = c.userAId===meId? c.userB : c.userA;
      const photo = (peer as any).photos?.find?.((p:any)=>p.isPrimary)?.url || (peer as any).photos?.[0]?.url || "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/1.jpg";
      const age = calcAge((peer as any).birthdate) ?? 21;
      return { id: c.id, peer:{ id:(peer as any).id, name:(peer as any).name, age, gender:(peer as any).gender ?? "other", photo }, lastMessage: c.messages[0]?.text || "", lastAt: c.messages[0]?.createdAt || c.createdAt };
    });
  return new Response(JSON.stringify({ items }), { headers: { "Content-Type":"application/json" } });
}

