import { describe, it, expect } from 'vitest';
import app from '../src/index';

function createMockEnvWithScore(cachedRow: Record<string, unknown> | null) {
  return {
    DB: {
      prepare: (query: string) => ({
        bind: (..._args: unknown[]) => ({
          first: async () => cachedRow,
          all: async () => ({ results: [], success: true, meta: {} }),
          run: async () => ({ results: [], success: true, meta: {} }),
        }),
        run: async () => ({ results: [], success: true, meta: {} }),
        first: async () => cachedRow,
        all: async () => ({ results: [], success: true, meta: {} }),
      }),
      batch: async () => [],
      dump: async () => new ArrayBuffer(0),
      exec: async () => ({ count: 0, duration: 0 }),
    } as unknown as D1Database,
  };
}

describe('GET /api/score/:owner/:repo', () => {
  it('returns cached score when available', async () => {
    const now = Math.floor(Date.now() / 1000);
    const env = createMockEnvWithScore({
      owner: 'facebook',
      repo: 'react',
      total_stars: 10000,
      clean_stars: 8700,
      suspicious_stars: 1300,
      clean_pct: 87.0,
      source: 'starscout',
      updated_at: now,
    });

    const res = await app.request('/api/score/facebook/react', {}, env);
    expect(res.status).toBe(200);
    const body = await res.json() as { owner: string; repo: string; clean_pct: number };
    expect(body.owner).toBe('facebook');
    expect(body.repo).toBe('react');
    expect(body.clean_pct).toBe(87.0);
  });

  it('returns 404 when no data available', async () => {
    const env = createMockEnvWithScore(null);
    const res = await app.request('/api/score/unknown/repo', {}, env);
    expect(res.status).toBe(404);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('no_data');
  });
});
