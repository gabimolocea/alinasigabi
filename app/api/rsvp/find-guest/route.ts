import { NextRequest, NextResponse } from "next/server";
import db, { dbReady } from "@/lib/db";

interface GuestRow {
  id: number;
  code: string;
  guest_name: string | null;
  max_persons: number;
  used: number;
}

// Remove diacritics and normalize for comparison
function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

// Score a guest match (lower = better)
function matchScore(query: string, guestName: string): number {
  const normQ = normalize(query);
  const normG = normalize(guestName);

  // Exact match after normalization
  if (normQ === normG) return 0;

  // Check if query is contained in guest name or vice versa
  if (normG.includes(normQ)) return 1;
  if (normQ.includes(normG)) return 2;

  // Check word-level matching
  const queryWords = normQ.split(/\s+/);
  const guestWords = normG.split(/\s+/);

  // How many query words match (substring) any guest word?
  let wordMatches = 0;
  for (const qw of queryWords) {
    if (qw.length < 2) continue;
    for (const gw of guestWords) {
      if (gw.includes(qw) || qw.includes(gw)) {
        wordMatches++;
        break;
      }
    }
  }
  if (wordMatches > 0 && wordMatches >= queryWords.filter(w => w.length >= 2).length) return 3;
  if (wordMatches > 0) return 5;

  // Levenshtein on full normalized strings
  const dist = levenshtein(normQ, normG);
  const maxLen = Math.max(normQ.length, normG.length);

  // Allow ~30% error tolerance
  if (maxLen > 0 && dist / maxLen <= 0.35) return 10 + dist;

  // Levenshtein on individual words
  let bestWordDist = Infinity;
  for (const qw of queryWords) {
    if (qw.length < 2) continue;
    for (const gw of guestWords) {
      const wd = levenshtein(qw, gw);
      const wMax = Math.max(qw.length, gw.length);
      if (wMax > 0 && wd / wMax <= 0.4) {
        bestWordDist = Math.min(bestWordDist, wd);
      }
    }
  }
  if (bestWordDist < Infinity) return 20 + bestWordDist;

  return Infinity; // No match
}

export async function POST(request: NextRequest) {
  try {
    await dbReady;
    const { name } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ guests: [] });
    }

    const allGuestsResult = await db.execute(
      "SELECT id, code, guest_name, max_persons, used FROM invitation_codes WHERE guest_name IS NOT NULL AND used = 0"
    );
    const allGuests = allGuestsResult.rows as unknown as GuestRow[];

    const scored = allGuests
      .map((g) => ({
        ...g,
        score: matchScore(name.trim(), g.guest_name!),
      }))
      .filter((g) => g.score < Infinity)
      .sort((a, b) => a.score - b.score)
      .slice(0, 1);

    return NextResponse.json({
      guests: scored.map((g) => ({
        id: g.id,
        guest_name: g.guest_name,
        max_persons: g.max_persons,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ guests: [], error: "Eroare internă." }, { status: 500 });
  }
}
