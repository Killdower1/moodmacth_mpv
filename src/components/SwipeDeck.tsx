"use client";
import { useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, useAnimationControls } from "framer-motion";
import ProfileCard from "./ProfileCard";
import type { Profile } from "@/types/profile";

export default function SwipeDeck({ profiles }: { profiles: Profile[] }) {
  const [idx, setIdx] = useState(0);
  const visible = useMemo(() => profiles.slice(idx, idx + 3), [profiles, idx]);

  // controls & motion value hanya untuk kartu paling atas
  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-15, 0, 15]);

  const SWIPE_OFFSET = 120;   // jarak minimal (px)
  const SWIPE_POWER  = 220;   // kombinasi jarak + kecepatan

  const doAdvance = () => setIdx((i) => Math.min(i + 1, profiles.length));

  async function forceSwipe(dir: 1 | -1) {
    await controls.start({
      x: dir * (typeof window === "undefined" ? 800 : window.innerWidth * 1.1),
      rotate: dir * 20,
      opacity: 0,
      transition: { duration: 0.25 },
    });
    // reset untuk kartu berikutnya
    controls.set({ x: 0, rotate: 0, opacity: 1 });
    x.set(0);
    doAdvance();
  }

  function handleDragEnd(_: any, info: { offset: { x: number }; velocity: { x: number } }) {
    const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.2;
    if (power > SWIPE_POWER || Math.abs(info.offset.x) > SWIPE_OFFSET) {
      const dir: 1 | -1 = info.offset.x > 0 ? 1 : -1;
      forceSwipe(dir);
    } else {
      // balik ke tengah
      controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 28 } });
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[78vh] overflow-hidden">
      {/* tombol opsional; bisa dihapus kalau full-gesture */}
      <div className="absolute z-[60] bottom-4 left-0 right-0 flex justify-center gap-4">
        <button onClick={() => forceSwipe(-1)} className="px-4 py-2 rounded-full bg-white/10 border border-white/20">
          Skip
        </button>
        <button onClick={() => forceSwipe(1)} className="px-4 py-2 rounded-full bg-white text-black">
          Like
        </button>
      </div>

      <div className="absolute inset-0">
        {/* Render dari belakang ke depan agar zIndex benar */}
        {visible
          .map((p, i) => ({ p, i })) // i: 0=top
          .reverse()
          .map(({ p, i }) => {
            const depth = i; // 0,1,2
            const isTop = depth === 0;
            const translateY = depth * 10;
            const scale = 1 - depth * 0.03;

            // kartu di belakang tidak menerima interaksi
            const baseStyle: any = {
              zIndex: 50 - depth,
              transform: `translateY(${translateY}px) scale(${scale})`,
              pointerEvents: isTop ? "auto" : "none",
            };

            if (!isTop) {
              // kartu non-top: pakai motion.div biasa untuk animasi halus saat stack bergeser
              return (
                <motion.div key={p.id} className="absolute inset-0" style={baseStyle} layout>
                  <ProfileCard profile={p} />
                </motion.div>
              );
            }

            // kartu paling atas: draggable
            return (
              <AnimatePresence key={p.id} mode="popLayout">
                <motion.div
                  className="absolute inset-0 will-change-transform"
                  style={{ ...baseStyle, x, rotate }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  animate={controls}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ProfileCard profile={p} />
                </motion.div>
              </AnimatePresence>
            );
          })}
      </div>
    </div>
  );
}
