import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import Link from "next/link";

export default async function MatchesPage(){
  const session = await requireSession();
  const me = await prisma.user.findUnique({ where: { email: session.user!.email! } });
  if(!me) throw new Error('User not found');

  const matches = await prisma.match.findMany({
    where: { OR: [ { userA: me.id }, { userB: me.id } ] },
    orderBy: { lastActiveAt: 'desc' }
  });

  return (
    <div className="card">
      <h2>Matches</h2>
      <ul>
        {matches.map(m=>{
          const partner = m.userA === me.id ? m.userB : m.userA;
          return <li key={m.id}><Link href={`/chat/${m.id}`}>Chat with {partner}</Link></li>
        })}
      </ul>
    </div>
  )
}
