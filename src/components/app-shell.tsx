"use client";
import React from "react";

export function AppShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <main className="max-w-md mx-auto p-6">{children}</main>
    </div>
  );
}
export default AppShell;
