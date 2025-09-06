import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
const PASSWORD = "Password123!";

async function main() {
  await prisma.$transaction([
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  const password = await bcrypt.hash(PASSWORD, 10);

  const users = [] as any[];
  for (let i = 1; i <= 40; i++) {
    const gender = faker.helpers.arrayElement(["male", "female", "other"]);
    const birthdate = faker.date.birthdate({ min: 18, max: 40, mode: "age" });
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        username: `user${i}`,
        password,
        name: `User ${i}`,
        gender,
        birthdate,
        bio: faker.lorem.sentence(),
        profile: {
          create: {
            bio: faker.lorem.sentence(),
            interests: [],
            photos: [],
          },
        },
      },
    });
    users.push(user);
  }

  for (let i = 0; i < 10; i++) {
    const a = users[i];
    const b = users[39 - i];
    await prisma.match.create({
      data: {
        userA: a.id.toString(),
        userB: b.id.toString(),
      },
    });
  }

  console.log(
    "✅ Seed complete. Example login: user1@example.com / Password123!"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
