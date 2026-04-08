import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { badRequest, notFound, forbidden } from '../lib/errors';

const router = new Hono();

// GET /rounds — list user's rounds
router.get('/', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const { limit, offset } = c.req.query();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('rounds')
    .select('*, courses(name, hole_count, par_score), score_cards(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(Number(limit) || 20)
    .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 20) - 1);

  if (error) badRequest(error.message);

  return c.json({ rounds: data ?? [] });
});

// GET /rounds/:id
router.get('/:id', standardRateLimit, authMiddleware, async (c) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('rounds')
    .select('*, courses(name, hole_count, par_score), score_cards(*, hole_scores(*))')
    .eq('id', c.req.param('id'))
    .single();

  if (error || !data) notFound('Round not found');

  return c.json({ round: data });
});

const holeScoreSchema = z.object({
  holeNumber: z.number().int().min(1).max(18),
  strokes: z.number().int().min(1).max(20),
  putts: z.number().int().min(0).max(10).optional(),
  fairwayHit: z.boolean().optional(),
  greenInRegulation: z.boolean().optional(),
});

const submitRoundSchema = z.object({
  courseId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  playedAt: z.string().datetime(),
  roundMode: z.enum(['stroke', 'match', 'scramble', 'best_ball']).default('stroke'),
  scores: z.array(holeScoreSchema).min(1).max(18),
  notes: z.string().max(500).optional(),
});

// POST /rounds — submit scores and trigger ranking point calculation
router.post(
  '/',
  standardRateLimit,
  authMiddleware,
  zValidator('json', submitRoundSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    // Verify course exists
    const { data: course } = await supabase
      .from('courses')
      .select('id, par_score, hole_count')
      .eq('id', body.courseId)
      .single();

    if (!course) notFound('Course not found');

    const totalStrokes = body.scores.reduce((sum, h) => sum + h.strokes, 0);
    const scoreToPar = totalStrokes - (course.par_score ?? 72);

    // Create round
    const { data: round, error: roundErr } = await supabase
      .from('rounds')
      .insert({
        user_id: user.id,
        course_id: body.courseId,
        booking_id: body.bookingId,
        played_at: body.playedAt,
        round_mode: body.roundMode,
        total_strokes: totalStrokes,
        score_to_par: scoreToPar,
        notes: body.notes,
        holes_played: body.scores.length,
      })
      .select()
      .single();

    if (roundErr) badRequest(roundErr.message);

    // Create scorecard
    const { data: scoreCard } = await supabase
      .from('score_cards')
      .insert({
        round_id: round.id,
        user_id: user.id,
        course_id: body.courseId,
        total_strokes: totalStrokes,
        score_to_par: scoreToPar,
      })
      .select()
      .single();

    // Create hole scores
    if (scoreCard) {
      await supabase.from('hole_scores').insert(
        body.scores.map((s) => ({
          score_card_id: scoreCard.id,
          hole_number: s.holeNumber,
          strokes: s.strokes,
          putts: s.putts,
          fairway_hit: s.fairwayHit,
          green_in_regulation: s.greenInRegulation,
        }))
      );
    }

    // Trigger ranking point calculation via RPC
    await supabase
      .rpc('calculate_ranking_points', {
        user_id: user.id,
        round_id: round.id,
        score_to_par: scoreToPar,
        holes_played: body.scores.length,
      })
      .catch(() => {
        // Non-blocking — ranking points calculated asynchronously if RPC unavailable
      });

    return c.json({ round, scoreCard }, 201);
  }
);

export { router as roundsRouter };
