import { describe, it, expect } from 'vitest';
import { computeScoreFromSeededData } from '../src/services/scoring';

describe('computeScoreFromSeededData', () => {
  it('computes correct clean percentage', () => {
    const score = computeScoreFromSeededData(1000, 130, 'facebook', 'react');
    expect(score.clean_pct).toBe(87);
    expect(score.clean_stars).toBe(870);
    expect(score.suspicious_stars).toBe(130);
    expect(score.total_stars).toBe(1000);
    expect(score.source).toBe('starscout');
  });

  it('handles zero total stars', () => {
    const score = computeScoreFromSeededData(0, 0, 'owner', 'repo');
    expect(score.clean_pct).toBe(0);
    expect(score.clean_stars).toBe(0);
  });

  it('handles all stars suspicious', () => {
    const score = computeScoreFromSeededData(500, 500, 'owner', 'repo');
    expect(score.clean_pct).toBe(0);
    expect(score.clean_stars).toBe(0);
  });

  it('handles more suspicious than total gracefully', () => {
    const score = computeScoreFromSeededData(100, 150, 'owner', 'repo');
    expect(score.clean_stars).toBe(0);
    expect(score.clean_pct).toBe(0);
  });

  it('rounds percentage to 2 decimal places', () => {
    const score = computeScoreFromSeededData(3, 1, 'owner', 'repo');
    expect(score.clean_pct).toBe(66.67);
  });
});
