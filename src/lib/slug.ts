export function safeSlug(input: string) {
  const base = (input ?? "file")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
  const s = base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return s || "file";
}