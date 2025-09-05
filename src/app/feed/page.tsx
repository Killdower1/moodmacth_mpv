import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";
import MoodBar from "@/components/MoodBar";

export const dynamic = "force-dynamic";

function moodBadge(m: string) {
  const labelMap: Record<string, string> = { CHILL: "Chill", HAPPY: "Happy", FLIRTY: "Flirty", HOT: "Hot" };
  const label = labelMap[m] || m;
  return <span className="badge">{label}</span>;
}

function calcAge(d?: Date | null) {
  if (!d) return -1;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export default async function FeedPage() {
  const session = await requireSession();

  const me = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    include: { profile: true },
  });
  if (!me) throw new Error("User not found");

  if (!me.profile) redirect("/onboarding");

  const isAdult = calcAge(me.birthdate) >= 18;

  const profiles = await prisma.profile.findMany({
    where: { userId: { not: me.id } },
    take: 100,
    include: { user: true },
  });

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Choose Mood</h3>
        <MoodBar isAdult={isAdult} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
        {profiles.length === 0 && (
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            Belum ada profil lain. Ajak tester lain untuk onboarding dulu ya.
          </div>
        )}
        {profiles.map((p) => (
          <div key={p.userId} className="card">
            <img
              src={p.photos?.[0] || `https://picsum.photos/seed/${p.userId.slice(0, 6)}/400/600`}
              alt=""
              style={{ width: "100%", borderRadius: 8 }}
            />
            <h3 style={{ margin: "8px 0 4px" }}>{p.user.name || p.user.email}</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{moodBadge("CHILL")}</div>
            <form action="/api/like" method="post">
              <input type="hidden" name="toUser" value={p.userId} />
              <button className="btn" style={{ marginTop: 8 }}>
                Like
              </button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
