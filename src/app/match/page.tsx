"use client";

import { AppShell } from "@/components/app-shell";

export default function MatchPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto w-full p-4">
          <h1 className="text-xl font-semibold mb-3">Matches</h1>
        {/* Placeholder agar build lolos; nanti bisa diganti UI chat/match */}
        <div className="rounded-2xl border border-zinc-700/40 bg-zinc-900/40 p-6">
          <h2 className="text-xl font-semibold mb-1">Matches</h2>
          <p className="opacity-80">Halaman match/chat coming soon.</p>
        </div>
      </div>
    </AppShell>
  );
}