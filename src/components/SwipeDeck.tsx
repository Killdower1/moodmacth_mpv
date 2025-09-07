"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useMotionValue, useTransform } from "framer-motion";
import ProfileCard, { type Profile } from "./ProfileCard";

export default function SwipeDeck({ mood }: { mood?: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const lastStack = useRef<string[]>([]);

  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-15, 0, 15]);

  async function loadNext() {
    setBusy(true);
    const url = mood ? `/api/feed?mood=${encodeURIComponent(mood)}` : "/api/feed";
    const res = await fetch(url, { cache: "no-store" }).then(r => r.json());
    setProfile(res.profile);
    setBusy(false);
  }

  useEffect(() => { loadNext(); }, []);

  async function advance(dir: 1 | -1, action: "LIKE" | "DISLIKE") {
    if (!profile) return;
    lastStack.current.push(profile.id);
    await controls.start({
      x: dir * (typeof window === "undefined" ? 800 : window.innerWidth * 1.1),
      rotate: dir * 20,
      opacity: 0, transition: { duration: 0.25 },
    });
    controls.set({ x: 0, rotate: 0, opacity: 1 });

    fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: profile.id, action }),
    })
      .then(r => r.json())
      .then(data => {
        if (data?.matched && data.conversationId) {
          if (window.confirm("It's a match! Say hi?")) {
            window.location.href = `/chat/${data.conversationId}`;
          }
        }
      })
      .catch(() => {});

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

  async function undo() {
    const prev = lastStack.current.pop();
    if (!prev) return;
    await fetch(`/api/swipe?targetId=${prev}`, { method: "DELETE" });
    loadNext();
  }

  if (!profile) {
    return <div className="grid place-items-center h-[70vh] text-white/70">No more profiles</div>;
  }

  return (
    <div className="relative h-[82vh] w-full">
      <div className="absolute inset-0 grid place-items-center px-4">
        <motion.div
          className="w-full max-w-sm"
          style={{ x, rotate }}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2}
          onDragEnd={onDragEnd}
          animate={controls}
          initial={{ opacity: 1 }}
        >
          <ProfileCard
            profile={profile}
            onLike={() => advance(1, "LIKE")}
            onDislike={() => advance(-1, "DISLIKE")}
          />
        </motion.div>
        <button onClick={undo} disabled={busy}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border border-white/20 bg-white/10">
          Undo
        </button>
      </div>
    </div>
  );
}
