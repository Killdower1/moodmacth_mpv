import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function calcAge(dobStr: string) {
  const d = new Date(dobStr);
  if (Number.isNaN(d.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: 'No user' }, { status: 400 });

  const fd = await req.formData();
  const name = String(fd.get('name') || '').trim();
  const dob = String(fd.get('dob') || '').trim();
  const gender = String(fd.get('gender') || '').trim();
  const photo = String(fd.get('photo') || '').trim();
  const bio = String(fd.get('bio') || '').trim();

  const age = calcAge(dob);
  if (age < 0) return NextResponse.json({ error: 'Tanggal lahir tidak valid' }, { status: 400 });
  if (age < 18) return NextResponse.json({ error: 'Usia minimal 18 tahun' }, { status: 400 });

  await prisma.user.update({
    where: { id: me.id },
    data: { name, birthdate: new Date(dob), gender }
  });

  await prisma.profile.upsert({
    where: { userId: me.id },
    update: { bio, photos: photo ? [photo] : [], lat: -6.2, lon: 106.8, interests: [] },
    create: { userId: me.id, bio, photos: photo ? [photo] : [], lat: -6.2, lon: 106.8, interests: [] }
  });

  return NextResponse.json({ ok: true });
}
