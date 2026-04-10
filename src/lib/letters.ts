export interface StaticLetter {
  id: string;
  title: string | null;
  body: string;
  authorDisplayName: string | null;
  authorAffiliation: string | null;
  authorClassYear: string | null;
  approvedAt: string | null;
}

const AFFILIATION_LABELS: Record<string, string> = {
  CURRENT_STUDENT: "Current Student",
  ALUMNI: "Alumni",
  GRADUATE_STUDENT: "Graduate Student",
  STAFF: "Staff",
  OTHER: "Community Member",
};

export function affiliationLabel(affiliation: string | null): string | null {
  if (!affiliation) return null;
  return AFFILIATION_LABELS[affiliation] || null;
}

let _cache: StaticLetter[] | null = null;

export async function loadLetters(): Promise<StaticLetter[]> {
  if (_cache) return _cache;

  // basePath is baked in at build time via next.config.js
  const basePath =
    process.env.NODE_ENV === "production"
      ? `/${process.env.NEXT_PUBLIC_REPO_NAME || "letters-to-lions"}`
      : "";

  const res = await fetch(`${basePath}/letters.json`);
  if (!res.ok) throw new Error("Failed to load letters");
  _cache = await res.json();
  return _cache!;
}

export function pickRandom(letters: StaticLetter[], excludeId?: string): StaticLetter {
  const pool = excludeId ? letters.filter((l) => l.id !== excludeId) : letters;
  const candidates = pool.length > 0 ? pool : letters;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
