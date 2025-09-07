import FeedClient from "./FeedClient";
import NavTop from "@/components/NavTop";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const h = headers();
  const origin = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || h.get("origin") || "http://localhost:3000";

  async function getFeed() {
    const res = await fetch(`${origin}/api/feed`, { cache: "no-store" });
    return res.json();
  }

  let data = await getFeed();

  // Dev auto-seed: kalau belum ada profil sama sekali, isi demo lalu fetch ulang
  if ((!data?.profiles || data.profiles.length === 0) && process.env.NODE_ENV !== "production") {
    await fetch(`${origin}/api/dev/seed`, { cache: "no-store" }).catch(()=>{});
    data = await getFeed();
  }

  const profiles = Array.isArray(data?.profiles) ? data.profiles : [];

  return (
    <>
      <NavTop />
      <div className="mx-auto max-w-md">
        <FeedClient profiles={profiles} />
      </div>
    </>
  );
}
