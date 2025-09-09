export type Me = { id: number | string; email: string; name?: string } | null;

export async function getMe(): Promise<Me> {
  try {
    const res = await fetch("/api/me", { method: "GET", credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    // coba beberapa kemungkinan bentuk response
    const id = data?.user?.id ?? data?.id ?? data?.userId ?? null;
    const email = data?.user?.email ?? data?.email ?? null;
    if (id == null || email == null) return null;
    return { id, email, name: data?.user?.name ?? data?.name };
  } catch {
    return null;
  }
}

/** Ambil hanya ID user (string) untuk dipakai di komponen client */
export async function fetchMeId(): Promise<string | null> {
  const me = await getMe();
  if (!me?.id) return null;
  return me.id.toString();
}
