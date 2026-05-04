export type ScoreColor = 'green' | 'yellow' | 'red' | 'grey';

export interface ScoreThresholds {
  greenMin: number;
  yellowMin: number;
}

export const PRESETS = {
  strict:   { greenMin: 90, yellowMin: 70 },
  balanced: { greenMin: 80, yellowMin: 50 },
  lenient:  { greenMin: 70, yellowMin: 40 },
} as const;

export function getScoreColor(pct: number, thresholds: ScoreThresholds = PRESETS.balanced): ScoreColor {
  if (pct >= thresholds.greenMin) return 'green';
  if (pct >= thresholds.yellowMin) return 'yellow';
  return 'red';
}

export function getScoreIcon(color: ScoreColor): string {
  switch (color) {
    case 'green': return '\u2713';
    case 'yellow': return '\u26A0';
    case 'red': return '\u2717';
    case 'grey': return '\u2014';
  }
}

export function formatPct(pct: number): string {
  return `${Math.round(pct)}%`;
}
