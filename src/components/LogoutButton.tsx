"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3 py-1 rounded border">
      Logout
    </button>
  );
}
