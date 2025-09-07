"use client";
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
    <div className="w-full h-full rounded-2xl overflow-hidden bg-neutral-900/30 border border-white/10 shadow-2xl">
      <div className="relative w-full h-3/4">
        <Image
          src={photo}
          alt={profile.name}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
          priority
        />
      </div>
      <div className="p-4 space-y-1">
        <h3 className="text-xl font-semibold">
          {profile.name}, <span className="text-white/60">{profile.age}</span>
        </h3>
        {profile.gender && <p className="text-white/60 text-sm">{profile.gender}</p>}
      </div>
    </div>
  );
}
