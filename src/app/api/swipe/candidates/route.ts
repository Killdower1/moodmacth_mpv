import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

/**
 * Candidates API:
 * - Ambil kandidat dari DB (tabel User) dengan filter gender opsional.
 * - Foto sementara pakai placeholder agar aman dari error tipe.
 * - Siap di-upgrade ke relasi photos ketika skema sudah jelas.
 */
function intParam(url: URL, key: string, defVal: number) {
  const raw = url.searchParams.get(key);
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) ? n : defVal;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gender = url.searchParams.get("gender");     // contoh: "M" | "F" | "all"
  const limit  = intParam(url, "limit", 20);
  // NOTE: minAge/maxAge diterima tapi belum diterapkan (butuh birthdate/age di schema)
  // const minAge = intParam(url, "minAge", 18);
  // const maxAge = intParam(url, "maxAge", 50);

  // Build where dinamis (pakai any biar aman terhadap skema yg belum fixed)
  const where: any = {};
  if (gender && gender !== "all") where.gender = gender;

  // Ambil user dari DB. Select minimal supaya tidak kena type error schema.
  const users = await prisma.user.findMany({
    where,
    take: limit,
    orderBy: { id: "desc" },
    select: {
      id: true,
      name: true,
      gender: true,
      // Kalau relasi photos SUDAH ada, aktifkan blok di bawah + mapping-nya:
      // photos: { select: { url: true }, orderBy: { id: "asc" }, take: 4 },
      // Tambahkan properti lain sesuai skema (hindari select field yg tak ada di schema).
    },
  });

  // Map ke shape yang dipakai SwipeDeck
  const items = users.map((u: any) => {
    // Placeholder foto kalau relasi belum dipakai
    const fallbackPhotos = [{ url: `https://i.pravatar.cc/640?u=${u.id}` }];

    // Kalau tadi aktifkan select photos, pakai:
    // const photos = (u.photos?.length ? u.photos : fallbackPhotos);

    return {
      id: String(u.id),
      name: u.name ?? "User",
      age: null,                    // akan diisi kalau skema age/birthdate siap
      gender: u.gender ?? null,
      photos: fallbackPhotos,       // ganti ke `photos` kalau relasi sudah aktif
      bio: "",
      distanceKm: Math.floor(Math.random() * 8) + 1,
    };
  });

  return NextResponse.json({ items });
}