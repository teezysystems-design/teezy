import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { badRequest, notFound, forbidden, conflict } from '../lib/errors';

const router = new Hono();

// GET /tournaments
router.get('/', standardRateLimit, async (c) => {
  const { status, courseId, limit, offset } = c.req.query();
  const supabase = createAdminClient();

  let query = supabase
    .from('tournaments')
    .select('*, courses(name, address), tournament_entries(count)')
    .order('created_at', { ascending: false })
    .limit(Number(limit) || 20)
    .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 20) - 1);

  if (status) query = query.eq('status', status);
  if (courseId) query = query.eq('course_id', courseId);

  const { data, error } = await query;
  if (error) badRequest(error.message);

  return c.json({ tournaments: data ?? [] });
});

// GET /tournaments/:id
router.get('/:id', standardRateLimit, async (c) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('tournaments')
    .select('*, courses(name, address, hole_count, par_score), tournament_entries(*, users(id, display_name, avatar_url))')
    .eq('id', c.req.param('id'))
    .single();

  if (error || !data) notFound('Tournament not found');

  return c.json({ tournament: data });
});

// GET /tournaments/:id/leaderboard — live scores
router.get('/:id/leaderboard', standardRateLimit, async (c) => {
  const supabase = createAdminClient();

  const { data: entries, error } = await supabase
    .from('tournament_entries')
    .select('*, users(id, display_name, avatar_url)')
    .eq('tournament_id', c.req.param('id'))
    .order('total_strokes', { ascending: true, nullsFirst: false });

  if (error) badRequest(error.message);

  const leaderboard = (entries ?? []).map((entry, idx) => ({
    position: idx + 1,
    ...entry,
  }));

  return c.json({ leaderboard });
});

const createTournamentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  courseId: z.string().uuid(),
  maxEntrants: z.number().int().min(2).max(128).default(32),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  entryFeeCents: z.number().int().min(0).default(0),
  format: z.enum(['stroke', 'match', 'scramble', 'best_ball', 'stableford']).default('stroke'),
});

// POST /tournaments
router.post(
  '/',
  standardRateLimit,
  authMiddleware,
  zValidator('json', createTournamentSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name: body.name,
        description: body.description,
        created_by_user_id: user.id,
        course_id: body.courseId,
        max_entrants: body.maxEntrants,
        start_date: body.startDate,
        end_date: body.endDate,
        entry_fee_cents: body.entryFeeCents,
        format: body.format,
        status: 'open',
      })
      .select()
      .single();

    if (error) badRequest(error.message);

    return c.json({ tournament: data }, 201);
  }
);

// POST /tournaments/:id/enter
router.post('/:id/enter', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const tournamentId = c.req.param('id');
  const supabase = createAdminClient();

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id, status, max_entrants')
    .eq('id', tournamentId)
    .single();

  if (!tournament) notFound('Tournament not found');
  if (tournament.status !== 'open') conflict('Tournament is not open for entry');

  const { count: entrantCount } = await supabase
    .from('tournament_entries')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId);

  if ((entrantCount ?? 0) >= tournament.max_entrants) {
    conflict('Tournament is full');
  }

  const { data: existing } = await supabase
    .from('tournament_entries')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) conflict('You are already entered in this tournament');

  const { data, error } = await supabase
    .from('tournament_entries')
    .insert({ tournament_id: tournamentId, user_id: user.id })
    .select()
    .single();

  if (error) badRequest(error.message);

  return c.json({ entry: data }, 201);
});

export { router as tournamentsRouter };
