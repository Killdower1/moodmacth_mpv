import { NextResponse } from "next/server";

/**
 * TEMP: Minimal conversations endpoint supaya build production lolos.
 * Nanti tinggal diganti dengan logic DB asli.
 */
export async function GET() {
  return NextResponse.json([]);
}