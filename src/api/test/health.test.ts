import { describe, it, expect } from 'vitest';
import app from '../src/index';

function createMockEnv(dbOverride?: Partial<D1Database>) {
  return {
    DB: {
      prepare: () => ({
        run: async () => ({ results: [], success: true, meta: {} }),
        bind: () => ({ run: async () => ({ results: [], success: true, meta: {} }) }),
        first: async () => null,
        all: async () => ({ results: [], success: true, meta: {} }),
      }),
      batch: async () => [],
      dump: async () => new ArrayBuffer(0),
      exec: async () => ({ count: 0, duration: 0 }),
      ...dbOverride,
    } as unknown as D1Database,
  };
}

describe('GET /api/health', () => {
  it('returns ok when database is reachable', async () => {
    const env = createMockEnv();
    const res = await app.request('/api/health', {}, env);
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; timestamp: string };
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });

  it('returns 503 when database is unreachable', async () => {
    const env = createMockEnv({
      prepare: () => ({
        run: async () => { throw new Error('DB down'); },
        bind: () => ({ run: async () => { throw new Error('DB down'); } }),
        first: async () => { throw new Error('DB down'); },
        all: async () => { throw new Error('DB down'); },
      }),
    } as unknown as Partial<D1Database>);
    const res = await app.request('/api/health', {}, env);
    expect(res.status).toBe(503);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('error');
  });
});
