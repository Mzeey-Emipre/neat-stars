CREATE TABLE IF NOT EXISTS repos (
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  total_stars INTEGER NOT NULL DEFAULT 0,
  clean_stars INTEGER NOT NULL DEFAULT 0,
  suspicious_stars INTEGER NOT NULL DEFAULT 0,
  clean_pct REAL NOT NULL DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('starscout', 'realtime')),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (owner, repo)
);

CREATE TABLE IF NOT EXISTS starscout_flags (
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  heuristic TEXT NOT NULL CHECK (heuristic IN ('low_activity', 'lockstep')),
  fake_star_count INTEGER NOT NULL DEFAULT 0,
  quarter TEXT NOT NULL,
  PRIMARY KEY (owner, repo, heuristic, quarter)
);

CREATE INDEX IF NOT EXISTS idx_repos_updated ON repos (updated_at);
CREATE INDEX IF NOT EXISTS idx_starscout_owner_repo ON starscout_flags (owner, repo);
