import Link from "next/link";

export default function NavTop() {
  return (
    <div className="mb-4">
      <div className="mx-auto max-w-md flex items-center justify-between py-3 px-4 rounded-xl bg-[#FFCD00] text-black shadow">
        <Link href="/feed" className="font-extrabold tracking-wide">moodmatch</Link>
        <nav className="text-sm flex gap-4">
          <Link href="/feed" className="hover:underline">Home</Link>
          <Link href="/matches" className="hover:underline">Matches</Link>
        </nav>
      </div>
    </div>
  );
}
