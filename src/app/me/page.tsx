import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export default async function MePage(){
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { email: session.user!.email! }, include: { profile:true } });
  return (
    <div className="card">
      <h2>My Profile</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
