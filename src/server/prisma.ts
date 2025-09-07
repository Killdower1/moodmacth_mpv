import { PrismaClient } from "@prisma/client";

declare global { var prisma: PrismaClient | undefined; }

const client = globalThis.prisma ?? new PrismaClient({ log: ["warn","error"] });

// Cek format UUID/cuid seadanya (cukup untuk dev)
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const cuidRe = /^c[^\s]{24,}$/;

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

client.$use(async (params, next) => {
  try {
    // Selalu normalize 'id' jadi string di where/data
    if (params?.args?.where) normalizeIds(params.args.where);
    if (params?.args?.data)  normalizeIds(params.args.data);

    // HARD GUARD: khusus User.findUnique dengan where.id yang tidak valid UUID/cuid -> return null (hindari error)
    if (params.model === "User" && params.action === "findUnique") {
      const id = params.args?.where?.id;
      if (typeof id !== "undefined") {
        const s = String(id);
        const ok = uuidRe.test(s) || cuidRe.test(s);
        if (!ok) {
          // emulate "not found" ketimbang throw
          return null as any;
        }
      }
    }
  } catch {
    // noop
  }
  return next(params);
});

export const prisma = client;
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = client;
export default prisma;

