import { Hono } from 'hono';
import { cors } from 'hono/cors';
import health from './routes/health';
import score from './routes/score';

type Bindings = { DB: D1Database };

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/api/*',
  cors({
    origin: ['https://github.com', 'chrome-extension://*', 'moz-extension://*'],
    allowMethods: ['GET'],
  })
);

app.route('/', health);
app.route('/', score);

app.get('/', (c) => {
  return c.json({
    name: 'Neat Stars API',
    version: '0.1.0',
    docs: 'https://github.com/Mzeey-Emipre/neat-stars',
  });
});

export default app;
