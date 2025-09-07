
import Image from "next/image";
export type Profile = { id: string; name: string; age: number; gender?: string; photo: string };
export default function ProfileCard({ profile, onLike, onDislike }:{ profile: Profile; onLike?: ()=>void; onDislike?: ()=>void; }){
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 card-shadow backdrop-blur-sm p-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
        <Image src={profile.photo} alt={profile.name} fill sizes="(max-width:768px) 100vw, 420px" className="object-cover"/>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="rounded-xl bg-black/40 backdrop-blur-md px-3 py-2">
            <h3 className="text-xl font-bold">{profile.name} <span className="text-white/70">â€¢ {profile.age}</span></h3>
            {profile.gender && <p className="text-white/70 text-sm">{profile.gender}</p>}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button aria-label="Dislike" onClick={onDislike} className="h-14 w-14 grid place-items-center rounded-full bg-white/10 border border-white/15 text-2xl">âœ•</button>
        <button aria-label="Like" onClick={onLike} className="h-14 w-14 grid place-items-center rounded-full bg-[#FFCD00] text-black text-2xl font-bold">â™¥</button>
      </div>
    </div>
  );
}



