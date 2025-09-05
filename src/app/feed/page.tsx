import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p>Unauthorized</p>
        <Link className="underline" href="/login">Go to login</Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-2">Feed</h1>
      <p className="opacity-70">Halo, {(session.user as any).id}</p>
      {/* TODO: taruh card swiper di sini nanti */}
    </div>
  );
}
