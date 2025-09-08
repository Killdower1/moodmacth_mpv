
import { prisma } from "@/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { toIntId } from "@/lib/id";
export async function GET(_req:Request, { params }:{ params:{ id:string } }){
  const s = await getServerSession(authOptions).catch(()=>null as any);
  if(!s?.user?.id) return new Response(JSON.stringify({ error:"unauthenticated" }), { status: 401 });
  const meId = toIntId(s.user.id);
  const convIdNum = Number(params.id);
  const convWhere:any = Number.isInteger(convIdNum)? { id: convIdNum } : { id: params.id };
  const conv = await prisma.conversation.findUnique({ where: convWhere, select:{ id:true, userAId:true, userBId:true } });
  if(!conv || (conv.userAId!==meId && conv.userBId!==meId)) return new Response(JSON.stringify({ error:"not-found" }), { status: 404 });
  const messages = await prisma.message.findMany({ where:{ conversationId: conv.id as any }, orderBy:{ createdAt:"asc" }, take:200 });
  return new Response(JSON.stringify({ messages }), { headers: { "Content-Type":"application/json" } });
}
export async function POST(req:Request, { params }:{ params:{ id:string } }){
  const s = await getServerSession(authOptions).catch(()=>null as any);
  if(!s?.user?.id) return new Response(JSON.stringify({ error:"unauthenticated" }), { status: 401 });
  const meId = toIntId(s.user.id);
  const body = await req.json().catch(()=>({})); const text = String(body?.text ?? "").trim();
  if(!text) return new Response(JSON.stringify({ error:"text-required" }), { status: 400 });
  const convIdNum = Number(params.id);
  const convWhere:any = Number.isInteger(convIdNum)? { id: convIdNum } : { id: params.id };
  const conv = await prisma.conversation.findUnique({ where: convWhere, select:{ id:true, userAId:true, userBId:true } });
  if(!conv || (conv.userAId!==meId && conv.userBId!==meId)) return new Response(JSON.stringify({ error:"not-found" }), { status: 404 });
  const msg = await prisma.message.create({ data:{ conversationId: conv.id as any, senderId: meId, text } });
  return new Response(JSON.stringify({ message: msg }), { headers: { "Content-Type":"application/json" } });
}
