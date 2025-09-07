const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

const male = (i) => `https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/${(i%50)+1}.jpg`;
const female = (i) => `https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/${(i%50)+1}.jpg`;

async function main() {
  for (let i = 0; i < 40; i++) {
    const isMale = i % 2 === 0;
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(" ")[0] }).toLowerCase();
    const mood = faker.helpers.arrayElement(["NORMAL","SERIOUS","FUN","HOT"]);
    await prisma.user.create({
      data: {
        email,
        passwordHash: "dev",
        name,
        gender: isMale ? "male" : "female",
        age: faker.number.int({ min: 21, max: 45 }),
        photos: { create: [{ url: isMale ? male(i) : female(i), isPrimary: true }] },
        preferences: {
          create: {
            preferredGenders: isMale ? ["female"] : ["male"],
            minAge: 20,
            maxAge: 45,
          },
        },
        lastActiveAt: new Date(),
        moodSessions: { create: { mood, startedAt: new Date(), active: true } },
      },
    });
  }
}
main().then(()=>prisma.$disconnect()).catch(async (e)=>{console.error(e); await prisma.$disconnect(); process.exit(1);});
