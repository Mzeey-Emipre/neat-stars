export interface RepoScore {
  owner: string;
  repo: string;
  total_stars: number;
  clean_stars: number;
  suspicious_stars: number;
  clean_pct: number;
  source: 'starscout' | 'realtime';
}

export interface StarscoutFlag {
  owner: string;
  repo: string;
  heuristic: 'low_activity' | 'lockstep';
  fake_star_count: number;
  quarter: string;
}

const CACHE_TTL_STARSCOUT = 24 * 60 * 60;
const CACHE_TTL_REALTIME = 60 * 60;

export async function getScore(
  db: D1Database,
  owner: string,
  repo: string
): Promise<RepoScore | null> {
  const cached = await getCachedScore(db, owner, repo);
  if (cached) return cached;

  const starscoutScore = await computeFromStarscout(db, owner, repo);
  if (starscoutScore) {
    await cacheScore(db, starscoutScore);
    return starscoutScore;
  }

  return null;
}

async function getCachedScore(
  db: D1Database,
  owner: string,
  repo: string
): Promise<RepoScore | null> {
  const row = await db
    .prepare('SELECT * FROM repos WHERE owner = ? AND repo = ?')
    .bind(owner, repo)
    .first<RepoScore & { updated_at: number }>();

  if (!row) return null;

  const now = Math.floor(Date.now() / 1000);
  const ttl = row.source === 'starscout' ? CACHE_TTL_STARSCOUT : CACHE_TTL_REALTIME;
  if (now - row.updated_at > ttl) return null;

  return {
    owner: row.owner,
    repo: row.repo,
    total_stars: row.total_stars,
    clean_stars: row.clean_stars,
    suspicious_stars: row.suspicious_stars,
    clean_pct: row.clean_pct,
    source: row.source,
  };
}

async function computeFromStarscout(
  db: D1Database,
  owner: string,
  repo: string
): Promise<RepoScore | null> {
  const flags = await db
    .prepare('SELECT * FROM starscout_flags WHERE owner = ? AND repo = ?')
    .bind(owner, repo)
    .all<StarscoutFlag>();

  if (!flags.results || flags.results.length === 0) return null;

  const byHeuristic = new Map<string, number>();
  for (const flag of flags.results) {
    const current = byHeuristic.get(flag.heuristic) ?? 0;
    byHeuristic.set(flag.heuristic, Math.max(current, flag.fake_star_count));
  }

  const suspicious_stars = Array.from(byHeuristic.values()).reduce((a, b) => a + b, 0);

  const staleRow = await db
    .prepare('SELECT total_stars FROM repos WHERE owner = ? AND repo = ?')
    .bind(owner, repo)
    .first<{ total_stars: number }>();

  if (!staleRow) {
    return null;
  }

  return computeScoreFromSeededData(staleRow.total_stars, suspicious_stars, owner, repo);
}

export function computeScoreFromSeededData(
  totalStars: number,
  suspiciousStars: number,
  owner: string,
  repo: string
): RepoScore {
  const clean_stars = Math.max(0, totalStars - suspiciousStars);
  const clean_pct = totalStars > 0 ? (clean_stars / totalStars) * 100 : 0;

  return {
    owner,
    repo,
    total_stars: totalStars,
    clean_stars,
    suspicious_stars: suspiciousStars,
    clean_pct: Math.round(clean_pct * 100) / 100,
    source: 'starscout',
  };
}

async function cacheScore(db: D1Database, score: RepoScore): Promise<void> {
  await db
    .prepare(
      `INSERT OR REPLACE INTO repos (owner, repo, total_stars, clean_stars, suspicious_stars, clean_pct, source, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      score.owner,
      score.repo,
      score.total_stars,
      score.clean_stars,
      score.suspicious_stars,
      score.clean_pct,
      score.source,
      Math.floor(Date.now() / 1000)
    )
    .run();
}
