"use client";
import { useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, useAnimationControls } from "framer-motion";
import ProfileCard, { type Profile } from "./ProfileCard";

export default function SwipeDeck({ profiles }: { profiles: Profile[] }) {
  const [idx, setIdx] = useState(0);
  const visible = useMemo(() => profiles.slice(idx, idx + 3), [profiles, idx]);

  return (
    // Tinggi area deck cukup lega agar ada margin; kartu akan di-center
    <div className="relative h-[86vh] w-full">
      <Stack
        visible={visible}
        onAdvance={() => setIdx(i => Math.min(i + 1, profiles.length))}
      />
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

  function onDragEnd(_: any, info: { offset: { x: number }, velocity: { x: number } }) {
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
        .map((p, i) => ({ p, i }))    // i: 0=top
        .reverse()
        .map(({ p, i }) => {
          const depth = i;
          const isTop = depth === 0;
          const translateY = depth * 10;
          const scale = 1 - depth * 0.03;

          const baseStyle: React.CSSProperties = {
            zIndex: 50 - depth,
            pointerEvents: isTop ? "auto" : "none",
          };

          // Wrapper grid untuk center kartu, memberi margin natural di sekeliling
          const Center = ({ children }: { children: React.ReactNode }) => (
            <div
              className="absolute inset-0 grid place-items-center px-4"
              style={{
                ...baseStyle,
                transform: `translateY(${translateY}px) scale(${scale})`,
              }}
            >
              <div className="w-full max-w-sm">{children}</div>
            </div>
          );

          return isTop ? (
            <AnimatePresence key={p.id} mode="popLayout">
              <Center>
                <motion.div
                  style={{ x, rotate }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={onDragEnd}
                  animate={controls}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ProfileCard
                    profile={p}
                    onLike={() => forceSwipe(1)}
                    onDislike={() => forceSwipe(-1)}
                  />
                </motion.div>
              </Center>
            </AnimatePresence>
          ) : (
            <Center key={p.id}>
              <motion.div layout>
                <ProfileCard profile={p} />
              </motion.div>
            </Center>
          );
        })}
    </div>
  );
}
