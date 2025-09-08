import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const me = await prisma.user.findFirst();
  if (!me) { console.log("No users in DB."); return; }
  const others = await prisma.user.findMany({ where: { id: { not: me.id } }, take: 10, orderBy: { lastActiveAt: "desc" } });
  if (others.length === 0) { console.log("No other users."); return; }

  const mutual = others.slice(0,3);
  const oneSide = others.slice(3,5);

  for (const u of mutual) {
    await prisma.like.upsert({ where: { fromId_toId: { fromId: me.id, toId: u.id } }, create: { fromId: me.id, toId: u.id }, update: {} });
    await prisma.like.upsert({ where: { fromId_toId: { fromId: u.id, toId: me.id } }, create: { fromId: u.id, toId: me.id }, update: {} });
    const exists = await prisma.match.findFirst({ where: { OR: [{ aId: me.id, bId: u.id }, { aId: u.id, bId: me.id }] } });
    if (!exists) { await prisma.match.create({ data: { aId: me.id, bId: u.id } }); }
  }
  for (const u of oneSide) {
    await prisma.like.upsert({ where: { fromId_toId: { fromId: me.id, toId: u.id } }, create: { fromId: me.id, toId: u.id }, update: {} });
  }
  console.log(Seeded  mutual matches and  one-sided likes for .);
}
main().finally(()=>prisma.());
