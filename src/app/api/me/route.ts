import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, gender: true, birthdate: true, image: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  const { name, gender, birthdate, image } = data;
  if (!name || !gender || !birthdate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name,
      gender,
      birthdate: new Date(birthdate),
      image,
    },
    select: { id: true, email: true, name: true, gender: true, birthdate: true, image: true },
  });
  return NextResponse.json(user);
}