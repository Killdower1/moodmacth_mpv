
"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useMotionValue, useTransform } from "framer-motion";
import ProfileCard, { type Profile } from "./ProfileCard";

export default function SwipeDeck() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const lastStack = useRef<string[]>([]);
  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-15, 0, 15]);

  async function loadNext() {
    try {
      const r = await fetch("/api/feed", { cache: "no-store" });
      const j = await r.json();
      setProfile(j?.profile ?? null);
    } catch {
      setProfile(null);
    }
  }
  useEffect(() => { loadNext(); }, []);

  async function advance(dir: 1 | -1, action: "LIKE" | "DISLIKE") {
    if (!profile) return;
    lastStack.current.push(profile.id);
    await controls.start({ x: dir * (window.innerWidth * 1.1), rotate: dir * 20, opacity: 0, transition: { duration: 0.25 } });
    controls.set({ x: 0, rotate: 0, opacity: 1 });
    fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: profile.id, action }),
    }).then(r => r.json()).then(d => {
      if (d?.matched && d?.conversationId) {
        // Navigate to chat on match
        window.location.href = `/chat/${d.conversationId}`;
      }
    }).catch(()=>{});
    await loadNext();
  }

  function onDragEnd(_: any, info: { offset: { x: number }, velocity: { x: number } }) {
    const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.2;
    if (power > 220 || Math.abs(info.offset.x) > 120) {
      advance(info.offset.x > 0 ? 1 : -1, info.offset.x > 0 ? "LIKE" : "DISLIKE");
    } else {
      controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 28 } });
    }
  }

  return (
    <div className="relative h-[82vh] w-full">
      <div className="absolute inset-0 grid place-items-center px-4">
        {profile ? (
          <motion.div className="w-full max-w-sm" style={{ x, rotate }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2}
            onDragEnd={onDragEnd} animate={controls} initial={{ opacity: 1 }}>
            <ProfileCard
              profile={profile}
              onLike={() => advance(1, "LIKE")}
              onDislike={() => advance(-1, "DISLIKE")}
            />
          </motion.div>
        ) : (
          <div className="text-white/70">No more profiles</div>
        )}
      </div>
    </div>
  );
}
