import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const male = (i:number)=>({ name: Adam , email: dam@demo.app, passwordHash: bcrypt.hashSync("demo123", 10), gender: "male" });
const female = (i:number)=>({ name: Bella , email: ella@demo.app, passwordHash: bcrypt.hashSync("demo123", 10), gender: "female" });

async function main() {
  const users = [
    ...Array.from({length:20}, (_,i)=>male(i+1)),
    ...Array.from({length:20}, (_,i)=>female(i+1)),
  ];
  for (const u of users) {
    const exist = await prisma.user.findUnique({ where: { email: u.email } });
    if (!exist) await prisma.user.create({ data: u });
  }
  console.log("Seeded credential users. Example: adam1@demo.app / demo123");
}
main().finally(()=>prisma.());
