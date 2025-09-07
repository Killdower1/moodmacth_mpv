import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Cek duplikat – select id saja (aman)
        const exists = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        if (exists) return NextResponse.json({ error: "Email already used" }, { status: 409 });

        const hash = await bcrypt.hash(password, 10);

        // PENTING: isi HANYA field yang ADA di schema
        // Jika passwordHash: String → simpan string hash
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hash, // NOTE: jika di schema Bytes, pakai Buffer.from(hash)
            },
            select: { id: true, email: true },
        });

        return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "register_failed" }, { status: 500 });
    }
}
