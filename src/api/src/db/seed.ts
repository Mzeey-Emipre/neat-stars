interface SeedRepo {
  owner: string;
  repo: string;
  total_stars: number;
  suspicious_stars: number;
  heuristic: 'low_activity' | 'lockstep';
}

const SEED_DATA: SeedRepo[] = [
  // Clean repos (high trust)
  { owner: 'facebook', repo: 'react', total_stars: 234000, suspicious_stars: 2340, heuristic: 'low_activity' },
  { owner: 'vuejs', repo: 'core', total_stars: 48000, suspicious_stars: 960, heuristic: 'low_activity' },
  { owner: 'sveltejs', repo: 'svelte', total_stars: 82000, suspicious_stars: 820, heuristic: 'low_activity' },
  { owner: 'microsoft', repo: 'vscode', total_stars: 170000, suspicious_stars: 1700, heuristic: 'low_activity' },
  { owner: 'denoland', repo: 'deno', total_stars: 101000, suspicious_stars: 2020, heuristic: 'low_activity' },

  // Moderate concern repos (for testing yellow badge)
  { owner: 'example-moderate', repo: 'ai-toolkit', total_stars: 5000, suspicious_stars: 1500, heuristic: 'low_activity' },
  { owner: 'example-moderate', repo: 'llm-wrapper', total_stars: 8000, suspicious_stars: 2800, heuristic: 'lockstep' },

  // High suspicion repos (for testing red badge)
  { owner: 'example-suspicious', repo: 'crypto-bot', total_stars: 12000, suspicious_stars: 8400, heuristic: 'lockstep' },
  { owner: 'example-suspicious', repo: 'auto-trader', total_stars: 6000, suspicious_stars: 5100, heuristic: 'low_activity' },
];

export function generateSeedSQL(): string {
  const now = Math.floor(Date.now() / 1000);
  const statements: string[] = [];

  for (const repo of SEED_DATA) {
    const clean = repo.total_stars - repo.suspicious_stars;
    const pct = Math.round((clean / repo.total_stars) * 10000) / 100;

    statements.push(
      `INSERT OR REPLACE INTO repos (owner, repo, total_stars, clean_stars, suspicious_stars, clean_pct, source, updated_at) ` +
      `VALUES ('${repo.owner}', '${repo.repo}', ${repo.total_stars}, ${clean}, ${repo.suspicious_stars}, ${pct}, 'starscout', ${now});`
    );

    statements.push(
      `INSERT OR REPLACE INTO starscout_flags (owner, repo, heuristic, fake_star_count, quarter) ` +
      `VALUES ('${repo.owner}', '${repo.repo}', '${repo.heuristic}', ${repo.suspicious_stars}, '250101');`
    );
  }

  return statements.join('\n');
}

if (import.meta.main) {
  console.log(generateSeedSQL());
}
