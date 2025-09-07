"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender, birthYear: Number(birthYear), photo }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Failed");
      setLoading(false);
      return;
    }
    router.push("/mood");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Onboarding</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <select
          className="w-full border rounded-lg p-3"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input
          type="number"
          className="w-full border rounded-lg p-3"
          placeholder="Birth year"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          required
        />
        <input
          className="w-full border rounded-lg p-3"
          placeholder="Photo URL"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          required
        />
        <button disabled={loading} className="w-full rounded-lg p-3 bg-black text-white disabled:opacity-50">
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
