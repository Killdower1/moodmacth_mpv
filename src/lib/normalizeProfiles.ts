import type { Profile } from "@/components/ProfileCard";

export function normalizeProfiles(rows: any[]): Profile[] {
  return rows.map((r: any, i: number) => ({
    id: r.id?.toString() ?? `u-${i}`,
    name: r.name ?? r.displayName ?? `User ${i + 1}`,
    age: r.age ?? 21,
    gender: r.gender ?? "other",
    photos: Array.isArray(r.photos) && r.photos.length
      ? r.photos
      : [
          r.avatarUrl ??
            r.photo ??
            "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/44.jpg",
        ],
  }));
}
