import { Hono } from 'hono';
import { getScore } from '../services/scoring';

type Bindings = { DB: D1Database };

const score = new Hono<{ Bindings: Bindings }>();

score.get('/api/score/:owner/:repo', async (c) => {
  const owner = c.req.param('owner');
  const repo = c.req.param('repo');

  if (!owner || !repo) {
    return c.json({ error: 'Missing owner or repo parameter' }, 400);
  }

  try {
    const result = await getScore(c.env.DB, owner, repo);

    if (!result) {
      return c.json({
        owner,
        repo,
        status: 'no_data',
        message: 'No star analysis available for this repository',
      }, 404);
    }

    return c.json(result);
  } catch {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default score;
