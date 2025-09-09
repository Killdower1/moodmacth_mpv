import { Prisma } from '@prisma/client';
import { PrismaClient } from "@prisma/client";

declare global { var prisma: PrismaClient | undefined; }

const client = globalThis.prisma ?? new PrismaClient({ log: ["warn","error"] });

// --- helpers ---
function normalizeIds(obj: any) {
  if (!obj || typeof obj !== "object") return;
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (k === "id" && typeof v !== "undefined" && typeof v !== "string") {
      (obj as any)[k] = String(v);
    } else if (v && typeof v === "object") {
      normalizeIds(v);
    }
  }
}
function stripBadUserSelect(args: any) {
  if (!args) return;
  const sel = args.select;
  const inc = args.include;
  if (sel && typeof sel === "object") {
    if ("username" in sel) delete sel.username; // kolom tidak ada di schema
    if ("age" in sel) delete sel.age;           // kalau masih ada sisa select age
  }
  if (inc && typeof inc === "object") {
    if ("username" in inc) delete inc.username;
    if ("age" in inc) delete inc.age;
  }
}

client.$use(async (params: any, next: any) => {
  try {
    // coerce semua id -> string di where/data
    if (params?.args?.where) normalizeIds(params.args.where);
    if (params?.args?.data)  normalizeIds(params.args.data);

    // khusus model User, buang select/include yang nyasar (username/age)
    if (params.model === "User") {
      stripBadUserSelect(params.args);
    }
  } catch { /* no-op */ }
  return next(params);
});

export const prisma = client;
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = client;
export default prisma;


