'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton({ className = '' }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={`px-3 py-2 rounded-lg border text-sm hover:opacity-90 ${className}`}
      type="button"
    >
      Log out
    </button>
  );
}
