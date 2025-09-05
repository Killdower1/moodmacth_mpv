'use client';
export default function AdminBanner() {
  return (
    <div className="card" style={{borderColor:"#5b7", background:"rgba(0,255,140,0.06)", marginBottom:12}}>
      <b>Admin mode</b> — buka <code>/admin</code> untuk moderasi users, matches, messages.
    </div>
  );
}
