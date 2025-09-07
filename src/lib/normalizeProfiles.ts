import type { Profile } from "@/components/ProfileCard";

export function normalizeProfiles(rows: any[]): Profile[] {
  return rows.map((r: any, i: number) => ({
    id: String(r.id ?? `u-${i}`),
    name: r.name ?? r.fullName ?? r.username ?? `User ${i + 1}`,
    age: r.age ?? r.profile?.age ?? 21,
    gender: r.gender ?? r.profile?.gender ?? "other",
    photos: Array.isArray(r.photos) && r.photos.length
      ? r.photos
      : [
          r.avatarUrl ??
            r.photo ??
            "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/44.jpg",
        ],
  }));
}
