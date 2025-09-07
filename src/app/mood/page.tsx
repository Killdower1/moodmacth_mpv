
import BumbleShell from "@/components/BumbleShell";
async function setMood(formData: FormData){ "use server";
  const mood = String(formData.get("mood") ?? "");
  await fetch(process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/mood` : "/api/mood", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ mood }) });
}
const MOODS=[{key:"NORMAL",label:"Normal"},{key:"SERIOUS",label:"Serious"},{key:"FUN",label:"Fun"},{key:"HOT",label:"Hot"}];
export default function MoodPage(){
  return (
    <BumbleShell>
      <h1 className="text-xl font-bold mb-4">Pilih Mood</h1>
      <form action={setMood} className="grid grid-cols-2 gap-3">
        {MOODS.map(m=> (<button key={m.key} name="mood" value={m.key} className="rounded-2xl bg-white/5 border border-white/10 px-4 py-6 hover:bg-white/10"><span className="block text-lg font-semibold">{m.label}</span><span className="text-xs text-white/60">{m.key}</span></button>))}
      </form>
      <p className="text-white/60 text-xs mt-4">Mood mempengaruhi rekomendasi feed kamu.</p>
    </BumbleShell>
  );
}

