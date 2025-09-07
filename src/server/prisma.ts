import { PrismaClient } from "@prisma/client";

declare global { var prisma: PrismaClient | undefined; }

const client = globalThis.prisma ?? new PrismaClient({ log: ["warn","error"] });

// Prisma middleware: untuk SEMUA operasi di model User,
// pastikan argumen "id" bertipe string (bukan number).
client.$use(async (params, next) => {
  if (params.model === "User") {
    // where.id
    const w: any = params.args?.where;
    if (w && typeof w.id !== "undefined" && typeof w.id !== "string") {
      w.id = String(w.id);
    }

    // data.* yang mungkin mengandung { id: ... } (connect/update nested)
    const coerce = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (typeof obj.id !== "undefined" && typeof obj.id !== "string") {
        obj.id = String(obj.id);
      }
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (v && typeof v === "object") coerce(v);
      }
    };
    if (params.args?.data) coerce(params.args.data);
  }
  return next(params);
});

export const prisma = client;
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = client;
export default prisma;
