import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession, setSessionCookie } from "@/lib/session";
import { normalizePhoneID, isValidE164 } from "@/lib/phone";

type Body = {
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  phone?: string;
};

export async function POST(req: NextRequest) {
  const sess = readSession();
  if (!sess?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;

  // ====== Validasi & normalisasi ======
  let dob: Date | null = null;
  if (body.dateOfBirth) {
    const d = new Date(body.dateOfBirth);
    if (isNaN(d.getTime())) return NextResponse.json({ error: "Tanggal lahir tidak valid" }, { status: 400 });
    dob = d;
  }

  const allowedGender = new Set(["male","female","other","MALE","FEMALE","OTHER"]);
  let gender: string | null = null;
  if (body.gender) {
    gender = body.gender.trim();
    if (!allowedGender.has(gender)) {
      gender = body.gender.toLowerCase();
      if (!allowedGender.has(gender)) return NextResponse.json({ error: "Gender tidak valid" }, { status: 400 });
    }
  }

  const bio = body.bio?.trim() || null;

  // Phone wajib diisi di step 1
  if (!body.phone) return NextResponse.json({ error: "Nomor HP wajib diisi" }, { status: 400 });
  const normalized = normalizePhoneID(String(body.phone));
  if (!isValidE164(normalized)) {
    return NextResponse.json({ error: "Format nomor tidak valid. Contoh: 0812... atau +62812..." }, { status: 400 });
  }

  // Cek duplicate phone (schema kita belum @unique secara fisik)
  const dup = await prisma.user.findFirst({
    where: { phone: normalized, NOT: { id: sess.uid } },
    select: { id: true },
  });
  if (dup) return NextResponse.json({ error: "Nomor sudah dipakai user lain" }, { status: 409 });

  // ====== Update user ======
  const user = await prisma.user.update({
    where: { id: sess.uid },
    data: {
      dateOfBirth: dob ?? undefined,
      gender: gender ?? undefined,
      bio: bio ?? undefined,
      phone: normalized,
      onboardingStep: { set: Math.max(sess.step ?? 0, 1) },
    },
    select: { onboardingStep: true },
  });

  // Refresh session cookie dgn step terbaru
  setSessionCookie({ uid: sess.uid, step: Math.max(user.onboardingStep ?? 0, 1) });

  return NextResponse.json({ ok: true, next: "/onboarding/2" });
}