/**
 * Normalisasi nomor HP Indonesia ke E.164 sederhana.
 * Contoh: 0812-3456-7890 -> +6281234567890, 62812... -> +62812...
 */
export function normalizePhoneID(input: string) {
  let s = (input || "").trim();
  // buang spasi/tanda
  s = s.replace(/[\s\-_.()]/g, "");
  // kalau sudah +62 biarkan
  if (s.startsWith("+62")) return s;
  // kalau 0... -> +62...
  if (s.startsWith("0")) return "+62" + s.slice(1);
  // kalau 62... -> +62...
  if (/^62\d+$/.test(s)) return "+" + s;
  // kalau sudah + dan digit -> biarkan (fallback)
  if (/^\+\d{8,15}$/.test(s)) return s;
  // terakhir: kalau cuma digit lokal, anggap Indonesia
  if (/^\d{8,15}$/.test(s)) return "+62" + s;
  return s;
}

export function isValidE164(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone); // min 8, max 15 digit
}