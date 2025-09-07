import { calcAge } from "./age";

export function normalizeProfile(p: any) {
  const photo =
    p.photos?.find?.((x: any) => x.isPrimary)?.url ??
    p.photos?.[0]?.url ??
    p.photo ??
    p.avatarUrl ??
    "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/44.jpg";
  return {
    id: String(p.id),
    name: p.name ?? "User",
    age: calcAge(p.birthdate) ?? 21,
    gender: p.gender ?? "other",
    photo,
  };
}

