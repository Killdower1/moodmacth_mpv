import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";

async function ensureMember(id: string, userId: string) {
  const c = await prisma.chat.findUnique({
    where: { id: id },
    select: { match: { select: { userAId: true, userBId: true } } },
  });
  if (!c) throw new Response("CHAT_NOT_FOUND", { status: 404 });
  const { userAId, userBId } = c.match;
  if (userId !== userAId && userId !== userBId) throw new Response("FORBIDDEN", { status: 403 });
}

export async function GET(_: Request, { params }: { params: { id: string }) {
  const userId = await getSessionUserId();
  await ensureMember(params.id, userId);

  const [mine, others] = await Promise.all([
    prisma.consent.findUnique({ where: { chatId_userId: { id: params.id, userId } } }),
    prisma.consent.findMany({ where: { id: params.id, NOT: { userId } } }),
  ]);
  const peer = others[0] ?? null;

  const allowed = {
    photo: !!(mine?.allowPhoto && peer?.allowPhoto),
    location: !!(mine?.allowLocation && peer?.allowLocation),
    videoCall: !!(mine?.allowVideoCall && peer?.allowVideoCall),
    voiceCall: !!(mine?.allowVoiceCall && peer?.allowVoiceCall),
  };

  return NextResponse.json({ mine, peer, allowed });
}

export async function PUT(req: Request, { params }: { params: { id: string }) {
  const userId = await getSessionUserId();
  await ensureMember(params.id, userId);

  const payload = await req.json() as Partial<{
    allowPhoto: boolean; allowLocation: boolean; allowVideoCall: boolean; allowVoiceCall: boolean;
  }>;

  const updated = await prisma.consent.upsert({
    where: { chatId_userId: { id: params.id, userId } },
    update: {
      allowPhoto:     payload.allowPhoto     ?? undefined,
      allowLocation:  payload.allowLocation  ?? undefined,
      allowVideoCall: payload.allowVideoCall ?? undefined,
      allowVoiceCall: payload.allowVoiceCall ?? undefined,
    },
    create: {
      id: params.id,
      userId,
      allowPhoto:     !!payload.allowPhoto,
      allowLocation:  !!payload.allowLocation,
      allowVideoCall: !!payload.allowVideoCall,
      allowVoiceCall: !!payload.allowVoiceCall,
    },
  });

  return NextResponse.json({ ok: true, mine: updated });
}