import { prisma } from "@/server/prisma";
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = prisma;
const PASSWORD = 'Password123!';

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const userIds: number[] = [];
  for (let i = 1; i <= 40; i++) {
    const gender = faker.helpers.arrayElement(['male', 'female', 'other']);
    const birthdate = faker.date.birthdate({ min: 18, max: 40, mode: 'age' });
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        username: `user${i}`,
        name: `User ${i}`,
        gender,
        birthdate,
        bio: faker.lorem.sentence(),
        avatarUrl: faker.image.avatar(),
        passwordHash,
      },
      select: { id: true },
    });
    userIds.push(user.id);
  }

  // create demo matches
  for (let i = 0; i < 10; i++) {
    const a = userIds[i];
    const b = userIds[39 - i];
    await prisma.match.upsert({
      where: { id: `seed-${a}-${b}` },
      update: {},
      create: {
        id: `seed-${a}-${b}`,
        userA: a,
        userB: b,
      },
    });
  }

  console.log('âœ… Seed complete. Example login: user1@example.com / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


