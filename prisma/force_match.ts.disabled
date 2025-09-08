import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const emailA = process.env.EMAIL_A || "adam1@demo.app";
  const emailB = process.env.EMAIL_B || "bella1@demo.app";
  const a = await prisma.user.findUnique({ where: { email: emailA }});
  const b = await prisma.user.findUnique({ where: { email: emailB }});
  if (!a || !b) { console.log("User not found", { a: !!a, b: !!b }); return; }

  await prisma.like.upsert({ where: { fromId_toId: { fromId: a.id, toId: b.id } }, create: { fromId: a.id, toId: b.id }, update: {} });
  await prisma.like.upsert({ where: { fromId_toId: { fromId: b.id, toId: a.id } }, create: { fromId: b.id, toId: a.id }, update: {} });

  const exists = await prisma.match.findFirst({ where: { OR: [{ aId: a.id, bId: b.id }, { aId: b.id, bId: a.id }] } });
  if (!exists) { await prisma.match.create({ data: { aId: a.id, bId: b.id } }); }

  console.log(`Forced match between ${emailA} and ${emailB}`);
}
main().finally(()=>prisma.$disconnect());
