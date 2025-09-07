import { redirect } from "next/navigation";
import { headers } from "next/headers";

async function setMood(formData: FormData) { "use server";
  const mood = String(formData.get("mood") ?? "");
  // absolute base URL supaya fetch di server nggak error
  const h = headers();
  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    h.get("origin") ||
    "http://localhost:3000";

  await fetch(`${origin}/api/mood`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood }),
    cache: "no-store",
  });

  // lanjut ke feed
  redirect("/feed");
}

const MOODS = [
  { key: "NORMAL", label: "Normal" },
  { key: "SERIOUS", label: "Serious" },
  { key: "FUN", label: "Fun" },
  { key: "HOT", label: "Hot" },
];

export default function MoodPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-5 shadow-xl">
        <h1 className="text-lg font-extrabold mb-2">Pilih Mood</h1>
        <p className="text-sm text-white/60 mb-4">
          Biar rekomendasi swipe kamu lebih pas.
        </p>

        <form action={setMood} className="grid grid-cols-2 gap-3">
          {MOODS.map((m) => (
            <button
              key={m.key}
              name="mood"
              value={m.key}
              className="rounded-xl bg-white/10 border border-white/10 py-3 hover:border-[#FFCD00] font-semibold"
            >
              {m.label}
            </button>
          ))}
        </form>
      </div>
    </div>
  );
}
