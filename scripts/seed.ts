import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "demo@demo.com" },
    update: {},
    create: {
      email: "demo@demo.com",
      name: "Demo User",
      passwordHash,
    },
  });
  console.log("✅ Demo user seeded: demo@demo.com / password123");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});