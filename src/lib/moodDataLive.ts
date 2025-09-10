import 'server-only';
import { prisma } from '@/lib/prisma';

/** Ambil user dari DB + fallback avatar default */
export async function fetchLiveUsers(limit = 50) {
  const users = await prisma.user.findMany({ take: limit });
  return users.map((u: any) => {
    const avatar = (u?.avatarUrl && String(u.avatarUrl).trim()) ? String(u.avatarUrl) : '/avatar-default.svg';
    return {
      id: u.id,
      name: u.name ?? 'User',
      email: u.email ?? '',
      avatarUrl: avatar,
      // alias supaya import lama tetap jalan tanpa ubah UI
      photo: avatar, image: avatar, photoUrl: avatar, img: avatar,
    };
  });
}

// Ekspor banyak alias (biar named import apapun masih valid)
export const users    = await fetchLiveUsers();
export const profiles = users;
export const cards    = users;
export const MOCK_USERS = users;
export const CANDIDATES = users;

export default users;
