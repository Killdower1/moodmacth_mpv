"use client";
import { useMemo, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, useAnimationControls } from "framer-motion";
import ProfileCard, { type Profile } from "./ProfileCard";

export default function SwipeDeck({ profiles }: { profiles: Profile[] }) {
  const [idx, setIdx] = useState(0);
  const visible = useMemo(() => profiles.slice(idx, idx + 3), [profiles, idx]);

  // KUNCI: tinggi deck tetap (≈78vh); kartu akan mengisi deck ini
  return (
    <div className="relative h-[78vh] w-full overflow-hidden">
      <Controls setIdx={setIdx} count={profiles.length} />
      <Stack visible={visible} onAdvance={() => setIdx((i) => Math.min(i + 1, profiles.length))} />
    </div>
  );
}

function Controls({ setIdx, count }: { setIdx: any; count: number }) {
  return (
    <div className="absolute z-[60] bottom-4 left-0 right-0 flex justify-center gap-4">
      <button
        onClick={() => setIdx((i: number) => Math.min(i + 1, count))}
        className="px-4 py-2 rounded-full bg-white/10 border border-white/20"
      >
        Skip
      </button>
      <button
        onClick={() => setIdx((i: number) => Math.min(i + 1, count))}
        className="px-4 py-2 rounded-full bg-white text-black"
      >
        Like
      </button>
    </div>
  );
}

function Stack({ visible, onAdvance }: { visible: Profile[]; onAdvance: () => void }) {
  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-15, 0, 15]);
  const SWIPE_OFFSET = 120;
  const SWIPE_POWER = 220;

  async function forceSwipe(dir: 1 | -1) {
    await controls.start({
      x: dir * (typeof window === "undefined" ? 800 : window.innerWidth * 1.1),
      rotate: dir * 20,
      opacity: 0,
      transition: { duration: 0.25 },
    });
    controls.set({ x: 0, rotate: 0, opacity: 1 });
    onAdvance();
  }

  function onDragEnd(_: any, info: { offset: { x: number }; velocity: { x: number } }) {
    const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.2;
    if (power > SWIPE_POWER || Math.abs(info.offset.x) > SWIPE_OFFSET) {
      forceSwipe(info.offset.x > 0 ? 1 : -1);
    } else {
      controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 28 } });
    }
  }

  return (
    <div className="absolute inset-0">
      {visible
        .map((p, i) => ({ p, i })) // i: 0=top
        .reverse() // render from back to front
        .map(({ p, i }) => {
          const depth = i;
          const isTop = depth === 0;
          const translateY = depth * 10;
          const scale = 1 - depth * 0.03;

          const baseStyle: CSSProperties = {
            zIndex: 50 - depth,
            transform: `translateY(${translateY}px) scale(${scale})`,
            pointerEvents: isTop ? "auto" : "none",
          };

          return isTop ? (
            <AnimatePresence key={p.id} mode="popLayout">
              <motion.div
                className="absolute inset-0"
                style={{ ...baseStyle, x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={onDragEnd}
                animate={controls}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProfileCard profile={p} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div key={p.id} className="absolute inset-0" style={baseStyle} layout>
              <ProfileCard profile={p} />
            </motion.div>
          );
        })}
    </div>
  );
}
