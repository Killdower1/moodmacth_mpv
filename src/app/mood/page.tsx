"use client";
import { useRouter } from "next/navigation";

const moods = ["NORMAL","SERIOUS","FUN","HOT"] as const;

export default function MoodPage() {
  const router = useRouter();
  async function pick(mood: string) {
    await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
    });
    router.push(`/feed?mood=${encodeURIComponent(mood)}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {moods.map(m => (
          <button
            key={m}
            onClick={() => pick(m)}
            className="p-6 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20"
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
