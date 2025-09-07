import NavTop from "@/components/NavTop";

export default function MatchesPage() {
  return (
    <>
      <NavTop />
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-xl">
          <h1 className="text-lg font-extrabold mb-2">Matches</h1>
          <p className="text-sm text-white/60">Belum ada percakapan. Mulai swipe untuk menemukan match 💬</p>
        </div>
      </div>
    </>
  );
}
