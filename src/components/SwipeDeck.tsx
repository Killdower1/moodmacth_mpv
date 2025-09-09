"use client";
import React from "react";

export type Profile = {
  id: string | number;
  name?: string;
  age?: number;
  avatar?: string;
  bio?: string;
};

type Props = {
  profiles?: Profile[];
  onSwipe?: (id: Profile["id"], dir: "left" | "right") => void;
  children?: React.ReactNode;
};

export default function SwipeDeck({ profiles = [], onSwipe, children }: Props) {
  // Kalau ada children, tampilkan apa adanya (fallback)
  if (children) return <div className="w-full">{children}</div>;

  // Placeholder sederhana biar build lulus; nanti ganti dengan deck asli
  return (
    <div className="grid gap-3">
      {profiles.map((p) => (
        <div key={p.id} className="p-4 border rounded-lg">
          <div className="font-medium">{p.name ?? `User #${p.id}`}</div>
          {p.avatar && (
            // NOTE: untuk demo saja; kalau pakai next/image, pastikan domain di next.config.js
            <img
              src={p.avatar}
              alt={String(p.name ?? p.id)}
              className="mt-2 w-full max-w-xs rounded"
            />
          )}
          {p.bio && <p className="text-sm mt-1 opacity-80">{p.bio}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onSwipe?.(p.id, "left")}
              className="px-3 py-1 border rounded"
            >
              Nope
            </button>
            <button
              onClick={() => onSwipe?.(p.id, "right")}
              className="px-3 py-1 border rounded"
            >
              Like
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
