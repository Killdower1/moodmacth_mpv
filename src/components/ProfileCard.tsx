"use client";

import Image from "next/image";
import { safeImageProps } from "@/lib/imageSafe";
import type { Profile } from "@/types/profile";

export default function ProfileCard({ profile }: { profile: Profile }) {
  const photo = profile.photos[0];
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden">
      {photo ? (
        <Image {...safeImageProps(photo)} alt={profile.name} fill className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-300" />
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
        <h3 className="text-xl font-semibold">
          {profile.name}
          {typeof profile.age === "number" ? `, ${profile.age}` : ""}
        </h3>
        {profile.gender && <p className="text-sm">{profile.gender}</p>}
      </div>
    </div>
  );
}
