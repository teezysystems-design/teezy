import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';

import { authRouter } from '../src/routes/auth';
import { coursesRouter } from '../src/routes/courses';
import { teeTimesRouter } from '../src/routes/tee-times';
import { bookingsRouter } from '../src/routes/bookings';
import { roundsRouter } from '../src/routes/rounds';
import { rankingsRouter } from '../src/routes/rankings';
import { socialRouter } from '../src/routes/social';
import { leaguesRouter } from '../src/routes/leagues';
import { tournamentsRouter } from '../src/routes/tournaments';
import { billingRouter } from '../src/routes/billing';
import { paymentsRouter } from '../src/routes/payments';
import { notificationsRouter } from '../src/routes/notifications';
import { aiMatchingRouter } from '../src/routes/ai-matching';
import { usersRouter } from '../src/routes/users';

const app = new Hono();

// ─── Global middleware ────────────────────────────────────────────────────────

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: [
      process.env['WEB_URL'] ?? 'http://localhost:3000',
      'capacitor://localhost',
    ],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (c) =>
  c.json({ status: 'ok', runtime: 'edge', ts: new Date().toISOString() })
);

// ─── Routes ──────────────────────────────────────────────────────────────────

app.route('/auth', authRouter);
app.route('/courses', coursesRouter);
app.route('/tee-times', teeTimesRouter);
app.route('/bookings', bookingsRouter);
app.route('/rounds', roundsRouter);
app.route('/rankings', rankingsRouter);
app.route('/social', socialRouter);
app.route('/leagues', leaguesRouter);
app.route('/tournaments', tournamentsRouter);
app.route('/billing', billingRouter);
app.route('/payments', paymentsRouter);
app.route('/notifications', notificationsRouter);
app.route('/ai-matching', aiMatchingRouter);
app.route('/users', usersRouter);

// ─── Error handling ───────────────────────────────────────────────────────────

app.notFound((c) =>
  c.json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404)
);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      { error: { code: 'HTTP_ERROR', message: err.message } },
      err.status
    );
  }
  console.error('[API Error]', err);
  return c.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    500
  );
});

// ─── Vercel Edge export ───────────────────────────────────────────────────────

export const config = { runtime: 'edge' };
export default app.fetch;
