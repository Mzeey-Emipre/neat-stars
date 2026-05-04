import { Hono } from 'hono';

type Bindings = { DB: D1Database };

const health = new Hono<{ Bindings: Bindings }>();

health.get('/api/health', async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1').run();
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    return c.json({ status: 'error', message: 'Database unreachable' }, 503);
  }
});

export default health;
