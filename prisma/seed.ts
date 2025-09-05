import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const femaleNames = ['Alya', 'Nadia', 'Salsa', 'Kirana', 'Dinda', 'Putri', 'Citra', 'Anya'];
const maleNames = ['Rizky', 'Bima', 'Fajar', 'Dion', 'Rama', 'Yoga', 'Andra', 'Bayu'];
const interests = ['Music','Travel','Coffee','Hiking','Movies','Reading','Photography'];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
function randInt(min:number,max:number){return Math.floor(Math.random()*(max-min+1))+min;}

async function main(){
  // Admin/testers
  const testers = [
    { email: 'ceo@moodmacth.local', name: 'CEO', gender:'M' },
    { email: 'dev@moodmacth.local', name: 'Developer', gender:'M' },
  ];

  for (const t of testers) {
    await prisma.user.upsert({
      where: { email: t.email },
      update: { name: t.name, gender: t.gender },
      create: { email: t.email, name: t.name, gender: t.gender }
    });
  }

  // Dummy users
  const girls = femaleNames.map((n,i)=>({name:n, email:`${n.toLowerCase()}@dummy.local`, gender:'F'}));
  const guys = maleNames.map((n,i)=>({name:n, email:`${n.toLowerCase()}@dummy.local`, gender:'M'}));
  const users = [...girls, ...guys];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, gender: u.gender },
      create: { email: u.email, name: u.name, gender: u.gender }
    });
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        bio: `Hi, I'm ${u.name}!`,
        interests,
        lat: -6.2 + Math.random()*0.4,  // around Jakarta
        lon: 106.8 + Math.random()*0.4,
        photos: [
          `https://picsum.photos/seed/${user.id.slice(0,6)}/400/600`
        ]
      },
      create: {
        userId: user.id,
        bio: `Hi, I'm ${u.name}!`,
        interests,
        lat: -6.2 + Math.random()*0.4,
        lon: 106.8 + Math.random()*0.4,
        photos: [
          `https://picsum.photos/seed/${user.id.slice(0,6)}/400/600`
        ]
      }
    });

    // MoodSession
    const moods = ['CHILL','HAPPY','FLIRTY','HOT'];
    const intent = ['CHAT','VC_FIRST','MEETUP_SOON'];
    const isAdult = Math.random()>0.3;
    const mood = rand(moods);
    const expires = new Date(Date.now() + 24*60*60*1000);
    await prisma.moodSession.create({
      data: {
        userId: user.id,
        mood,
        intent: rand(intent),
        boundaries: { topics_ok: true, media_ok: false, vc_first: false, meetup_after_minutes: 30 },
        expiresAt: expires,
        active: true
      }
    });
  }

  console.log('Seed completed.');
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
