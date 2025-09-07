
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
export async function GET(){
  const s = await getServerSession(authOptions).catch(()=>null as any);
  if(!s?.user?.id) return new Response(JSON.stringify({}), { status: 401 });
  return new Response(JSON.stringify({ id: s.user.id, name: s.user.name ?? null }), { headers: { "Content-Type":"application/json" } });
}

