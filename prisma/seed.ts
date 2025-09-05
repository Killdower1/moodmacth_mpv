import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const PASSWORD = 'secret1234';
const HASH_ROUNDS = 10;
const FIXED_USERS = [
  {
    email: 'test1@moodmacth.local',
    name: 'Test One',
    gender: 'male',
  },
  {
    email: 'test2@moodmacth.local',
    name: 'Test Two',
    gender: 'female',
  },
];

function randomGender(): 'male' | 'female' | 'other' {
  const g = faker.helpers.arrayElement(['male', 'female', 'other']);
  return g;
}

function randomBirthdate(): Date {
  const now = new Date();
  const minAge = 18;
  const maxAge = 35;
  const age = faker.number.int({ min: minAge, max: maxAge });
  const birthYear = now.getFullYear() - age;
  const birthMonth = faker.number.int({ min: 0, max: 11 });
  const birthDay = faker.number.int({ min: 1, max: 28 });
  return new Date(birthYear, birthMonth, birthDay);
}

function randomAvatar(gender: string): string {
  if (gender === 'male' || gender === 'female') {
    const idx = faker.number.int({ min: 1, max: 99 });
    return `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${idx}.jpg`;
  }
  // For 'other', use a neutral avatar
  return `https://randomuser.me/api/portraits/lego/${faker.number.int({ min: 1, max: 9 })}.jpg`;
}

async function main() {
  console.log('🔄 Clearing old users...');
  await prisma.user.deleteMany();

  console.log('🔑 Hashing password...');
  const passwordHash = await bcrypt.hash(PASSWORD, HASH_ROUNDS);

  const users = [];

  // Insert fixed test accounts
  for (const u of FIXED_USERS) {
    users.push({
      email: u.email,
      passwordHash,
      name: u.name,
      gender: u.gender,
      birthdate: randomBirthdate(),
      image: randomAvatar(u.gender),
    });
  }

  // Generate 38 random users
  for (let i = 0; i < 38; i++) {
    const gender = randomGender();
    const firstName = faker.person.firstName(gender === 'male' ? 'male' : gender === 'female' ? 'female' : undefined);
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName, provider: 'moodmacth.local' }).toLowerCase();
    users.push({
      email,
      passwordHash,
      name,
      gender,
      birthdate: randomBirthdate(),
      image: randomAvatar(gender),
    });
  }

  console.log(`🚀 Inserting ${users.length} users...`);
  await prisma.user.createMany({ data: users });

  const total = await prisma.user.count();
  console.log(`✅ Seed complete. Total users: ${total}`);
  console.log('---');
  console.log('Test accounts:');
  console.log('test1@moodmacth.local / secret1234');
  console.log('test2@moodmacth.local / secret1234');
  console.log('---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
