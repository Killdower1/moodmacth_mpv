import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/server/prisma";

export async function GET(_: Request, { params }: { params: { matchId: string } }) {
  const s = await getServerSession(authOptions);
  if (!s?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const match = await prisma.match.findUnique({ where: { id: params.matchId } });
  if (!match || (match.userAId !== s.user.id && match.userBId !== s.user.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { matchId: match.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

const Body = z.object({ text: z.string().min(1).max(1000) });

export async function POST(req: Request, { params }: { params: { matchId: string } }) {
  const s = await getServerSession(authOptions);
  if (!s?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const match = await prisma.match.findUnique({ where: { id: params.matchId } });
  if (!match || (match.userAId !== s.user.id && match.userBId !== s.user.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { text } = Body.parse(await req.json());
  const msg = await prisma.message.create({
    data: { matchId: match.id, senderId: s.user.id as string, type: "TEXT", text },
  });

  return NextResponse.json({ ok: true, message: msg });
}