"use client";
import dynamic from "next/dynamic";
import React from "react";

// coba ambil default export dulu, kalau tidak ada ambil named export
const FallbackShell = ({ children }: { children?: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
    <main className="max-w-md mx-auto p-6">{children}</main>
  </div>
);

// dynamic dengan fallback berlapis: BumbleShell -> app-shell -> FallbackShell
const Bumble = dynamic(async () => {
  try {
    const m = await import("@/components/BumbleShell");
    return (m as any).default ?? (m as any).BumbleShell;
  } catch { throw 0; }
}, { ssr:false, loading: () => <FallbackShell /> });

const App = dynamic(async () => {
  try {
    const m = await import("@/components/app-shell");
    return (m as any).default ?? (m as any).AppShell;
  } catch { return FallbackShell as any; }
}, { ssr:false });

export function UseShell({ children }: { children?: React.ReactNode }) {
  // render Bumble dulu; kalau gagal, render App; kalau gagal lagi, FallbackShell
  try { return <Bumble>{children}</Bumble>; }
  catch { return <App>{children}</App>; }
}
