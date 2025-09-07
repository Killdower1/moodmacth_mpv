import { prisma } from "@/server/prisma";
import { requireAdminEmails } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminEmails();

  const [users, matches, messages, reports] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { profile: true } }),
    prisma.match.findMany({ orderBy: { lastActiveAt: "desc" }, take: 50 }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  // Build index user untuk label
  const ids = new Set<number>();
  users.forEach(u => ids.add(u.id));
  matches.forEach((m:any)=> { if(m.userA) ids.add(m.userA); if(m.userB) ids.add(m.userB); });
  messages.forEach((m:any)=> { if(m.fromUser) ids.add(m.fromUser); });
  reports.forEach((r:any)=> { if(r.fromUserId) ids.add(r.fromUserId); if(r.targetUserId) ids.add(r.targetUserId); });

  const idList = Array.from(ids);
  const mapUsers = new Map((await prisma.user.findMany({
    where: { id: { in: idList } },
    select: { id: true, email: true, name: true }})).map(u => [u.id, u]));

  const ulabel = (id?: number|null) => {
    if(!id) return "â€”";
    const u = mapUsers.get(id);
    return u ? (u.name || u.email) : `(unknown:${String(id).slice(0,6)})`;
  };

  return (
    <div className="grid" style={{gridTemplateColumns:"1fr"}}>
      {/* USERS */}
      <div className="card">
        <h2>Admin â€” Users</h2>
        <p>Total (showing latest 50).</p>
        <div className="grid" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
          {users.map(u => (
            <div key={u.id} className="card">
              <div><b>{u.name || u.email}</b></div>
              <div style={{opacity:.8, fontSize:12}}>{u.email}</div>
              <div style={{marginTop:6}}>Profile: <span className="badge">{u.profile ? "YES" : "NO"}</span></div>
              <div style={{display:"flex", gap:8, marginTop:8}}>
                <form action="/api/admin/suspend" method="post">
                  <input type="hidden" name="userId" value={String(u.id)} />
                  <button className="btn" disabled={!u.profile}>Suspend</button>
                </form>
                <form action="/api/admin/unsuspend" method="post">
                  <input type="hidden" name="userId" value={String(u.id)} />
                  <button className="btn">Unsuspend</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MATCHES */}
      <div className="card">
        <h2>Admin â€” Matches</h2>
        <div className="grid" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
          {matches.map((m:any) => (
            <div key={m.id} className="card">
              <div><b>ID:</b> {m.id}</div>
              <div><b>UserA:</b> {ulabel(m.userA)}</div>
              <div><b>UserB:</b> {ulabel(m.userB)}</div>
              <div style={{marginTop:8}}>
                <form action="/api/admin/unmatch" method="post">
                  <input type="hidden" name="matchId" value={m.id} />
                  <button className="btn">Force Unmatch</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MESSAGES */}
      <div className="card">
        <h2>Admin â€” Recent Messages</h2>
        <div className="grid" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
          {messages.map((ms:any) => (
            <div key={ms.id} className="card">
              <div><b>ID:</b> {ms.id}</div>
              <div><b>Match:</b> {ms.matchId}</div>
              <div style={{marginTop:6, whiteSpace:"pre-wrap"}}>{ms.content}</div>
              <div style={{marginTop:8}}>
                <form action="/api/admin/message/delete" method="post">
                  <input type="hidden" name="messageId" value={ms.id} />
                  <button className="btn">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REPORTS */}
      <div className="card">
        <h2>Admin â€” Reports</h2>
        <div className="grid" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
          {reports.map((r:any) => (
            <div key={r.id} className="card">
              <div><b>ID:</b> {r.id}</div>
              <div><b>From:</b> {ulabel(r.fromUserId)}</div>
              <div><b>Target:</b> {ulabel(r.targetUserId)}</div>
              {r.messageId && <div><b>MsgID:</b> {r.messageId}</div>}
              <div style={{marginTop:6, whiteSpace:"pre-wrap"}}>{r.reason}</div>
              <div style={{display:"flex", gap:8, marginTop:8}}>
                <form action="/api/admin/suspend" method="post">
                  <input type="hidden" name="userId" value={r.targetUserId ? String(r.targetUserId) : ""} />
                  <button className="btn" disabled={!r.targetUserId}>Suspend Target</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




