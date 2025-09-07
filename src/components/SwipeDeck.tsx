"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

export type Profile = {
  id: string;
  name: string;
  age?: number | null;
  avatarUrl?: string | null;
};

function IconX() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}
function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12 21s-7.034-4.247-9.428-7.59C.32 10.53 1.06 7.35 3.59 6.12 5.39 5.24 7.53 5.7 9 7.05 10.47 5.7 12.61 5.24 14.41 6.12c2.53 1.23 3.27 4.41.99 7.29C19.034 16.753 12 21 12 21z"/>
    </svg>
  );
}

export default function SwipeDeck({ profiles: initial }: { profiles: Profile[] }) {
  const [index, setIndex] = useState(0);
  const profile = initial[index];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const likeOpacity = useTransform(x, [60, 160], [0, 1]);
  const nopeOpacity = useTransform(x, [-60, -160], [0, 1]);

  const hasNext = index < initial.length - 1;

  async function swipe(dir: "like" | "nope") {
    const p = profile;
    setIndex((i) => i + 1);
    // fire-and-forget, jangan blok UI
    fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: p?.id, direction: dir }),
    }).catch(() => {});
  }

  if (!profile) {
    return (
      <div className="text-center text-white/70 py-20">
        <p>Habis untuk hari ini ✨</p>
      </div>
    );
  }

  const imgSrc =
    profile.avatarUrl && profile.avatarUrl.startsWith("http")
      ? profile.avatarUrl
      : `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(profile.name || "user")}`;

  return (
    <div className="w-full mx-auto max-w-md">
      <div className="relative h-[420px]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={profile.id}
            className="absolute inset-0"
            style={{ x, rotate }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x > 120) swipe("like");
              else if (info.offset.x < -120) swipe("nope");
              else x.set(0);
            }}
          >
            <div className="h-full w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl flex flex-col">
              <div className="relative flex-1 bg-black/20">
                {/* pakai img biasa supaya nggak perlu konfigurasi next/image domains */}
                <img
                  src={imgSrc}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {/* badges like/nope */}
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute top-3 left-3 px-2 py-1 rounded-md bg-green-500/90 text-xs font-bold"
                >
                  LIKE
                </motion.div>
                <motion.div
                  style={{ opacity: nopeOpacity }}
                  className="absolute top-3 right-3 px-2 py-1 rounded-md bg-red-500/90 text-xs font-bold"
                >
                  NOPE
                </motion.div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-extrabold text-lg truncate">
                    {profile.name} {profile.age ? <span className="text-white/70 font-semibold">• {profile.age}</span> : null}
                  </p>
                  <p className="text-sm text-white/50 truncate">{hasNext ? `${initial.length - index - 1} left` : "Last one"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => swipe("nope")}
                    className="h-12 w-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15"
                    aria-label="Nope"
                  >
                    <IconX />
                  </button>
                  <button
                    onClick={() => swipe("like")}
                    className="h-12 w-12 rounded-full bg-[#FFCD00] text-black border border-black/10 flex items-center justify-center hover:opacity-90"
                    aria-label="Like"
                  >
                    <IconHeart />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
