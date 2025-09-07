import Image from "next/image";

export type Profile = {
  id: string;
  name: string;
  age: number;
  gender?: string;
  photos: string[];
};

export default function ProfileCard({ profile }: { profile: Profile }) {
  const photo = profile.photos?.[0] ?? "/placeholder.jpg";

  return (
    <div className="grid grid-rows-[1fr_auto] w-full h-full rounded-2xl overflow-hidden bg-neutral-900/40 border border-white/10 shadow-2xl">
      <div className="relative">
        <Image
          src={photo}
          alt={profile.name}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
          priority
        />
        <div className="absolute left-3 top-3 text-white/70 text-xs pointer-events-none z-20">© 2025 Moodmacth</div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold">
          {profile.name}, <span className="text-white/60">{profile.age}</span>
        </h3>
        {profile.gender && <p className="text-white/60 text-sm">{profile.gender}</p>}
      </div>
    </div>
  );
}
