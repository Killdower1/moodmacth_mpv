
import Image from "next/image";

export type Profile = { id: string; name: string; age: number; gender?: string; photo: string };

export default function ProfileCard({
  profile, onLike, onDislike,
}: { profile: Profile; onLike?: () => void; onDislike?: () => void }) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm p-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
        <Image src={profile.photo} alt={profile.name} fill sizes="(max-width:768px) 100vw, 600px" className="object-cover" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold truncate">
            {profile.name}, <span className="text-white/60">{profile.age}</span>
          </h3>
          {profile.gender && <p className="text-white/60 text-sm truncate">{profile.gender}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Dislike" onClick={onDislike}
            className="h-11 w-11 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95">✕</button>
          <button aria-label="Love" onClick={onLike}
            className="h-11 w-11 rounded-full border border-white/15 bg-white text-black hover:opacity-90 active:scale-95">♥</button>
        </div>
      </div>
    </div>
  );
}
