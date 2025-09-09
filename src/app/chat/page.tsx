import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUserIdOrThrow } from '@/lib/auth';
import { MessageSquare, Circle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ChatListPage() {
  const me = getCurrentUserIdOrThrow();

  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: me }, { userBId: me }] },
    include: {
      userA: true,
      userB: true,
      messages: { take: 1, orderBy: { createdAt: 'desc' } },
    },
    orderBy: { lastActiveAt: 'desc' },
  });

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-bold mb-2">Chat</h1>

      {matches.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          Belum ada percakapan. Mulai dari halaman <span className="font-semibold">Matches</span>.
        </div>
      )}

      {matches.map((m) => {
        const other = m.userAId === me ? m.userB : m.userA;
        const last = m.messages[0];
        const unread = last && last.senderId !== me && !last.readAt;

        return (
          <Link
            key={m.id}
            href={/chat/}
            className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 hover:bg-zinc-800"
          >
            <div className="h-10 w-10 rounded-full bg-zinc-700 grid place-items-center">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{other?.name ?? other?.email ?? 'User'}</div>
                {unread && <Circle className="h-3 w-3 fill-current text-blue-400" />}
              </div>
              <div className="text-sm text-zinc-400 truncate">
                {last ? (last.content || '—') : 'Belum ada pesan'}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
