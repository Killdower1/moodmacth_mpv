import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { decodeUserIdFromSession } from '@/lib/session';
export const dynamic = 'force-dynamic';

export default async function MoodPage() {
  const me = decodeUserIdFromSession();
  if (!me) {
    redirect('/login'); // atau '/login' sesuai rute kamu
  }

  const users = await prisma.user.findMany({
    where: { id: { not: me } },
    take: 50,
  });

  return (
    <div className='mx-auto max-w-5xl p-4'>
      <h1 className='text-2xl font-bold mb-4'>Discover</h1>
      {users.length === 0 && (
        <div className='rounded-lg border border-zinc-800 bg-zinc-900 p-4'>
          Belum ada user lain. Tambahkan data user dulu (seed atau registrasi akun lain).
        </div>
      )}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {users.map((u) => {
          const avatar = (u as any).avatarUrl && String((u as any).avatarUrl).trim().length > 0
            ? String((u as any).avatarUrl)
            : '/avatar-default.svg';

          const displayName = (u as any).name || (u as any).email || 'User';
          return (
            <div key={u.id} className='rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden'>
              <div className='aspect-square relative'>
                <Image
                  src={avatar}
                  alt={displayName}
                  fill
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw'
                  className='object-cover'
                />
              </div>
              <div className='p-3 space-y-1'>
                <div className='font-semibold'>{displayName}</div>
                <div className='text-xs text-zinc-400 break-all'>{(u as any).email}</div>
                <div className='pt-2'>
                  <Link href={'/chat'} className='inline-flex items-center gap-2 rounded-lg bg-yellow-400 text-black px-3 py-1.5 font-semibold'>
                    Chat
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}




