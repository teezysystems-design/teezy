import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { badRequest, notFound } from '../lib/errors';

const router = new Hono();

/** Resolve Supabase Auth UUID → profile users.id */
async function resolveProfileId(supabaseUserId: string): Promise<string> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('users')
    .select('id')
    .eq('supabase_user_id', supabaseUserId)
    .single();
  if (error || !data) notFound('Profile not found — complete onboarding first');
  return data.id;
}

// GET /rounds — list user's rounds
router.get('/', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const profileId = await resolveProfileId(user.id);
  const { limit, offset } = c.req.query();
  const supabase = createAdminClient();

  const limitNum = Number(limit) || 20;
  const offsetNum = Number(offset) || 0;

  const { data, error } = await supabase
    .from('rounds')
    .select('*, courses(name, hole_count, par_score)')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false })
    .range(offsetNum, offsetNum + limitNum - 1);

  if (error) badRequest(error.message);

  return c.json({ data: data ?? [] });
});

// GET /rounds/:id
router.get('/:id', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  await resolveProfileId(user.id); // verify auth
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('rounds')
    .select('*, courses(name, hole_count, par_score)')
    .eq('id', c.req.param('id'))
    .single();

  if (error || !data) notFound('Round not found');

  // Get hole scores if they exist
  const { data: holeScores } = await supabase
    .from('hole_scores')
    .select('hole_number, strokes, par, fairway_hit, green_in_regulation, putts')
    .eq('user_id', data.user_id)
    .order('hole_number', { ascending: true });

  return c.json({
    data: {
      ...data,
      holeScores: (holeScores ?? []).map((h: Record<string, unknown>) => ({
        holeNumber: h.hole_number,
        strokes: h.strokes,
        par: h.par,
        fairwayHit: h.fairway_hit,
        greenInRegulation: h.green_in_regulation,
        putts: h.putts,
      })),
    },
  });
});

const holeScoreSchema = z.object({
  holeNumber: z.number().int().min(1).max(18),
  strokes: z.number().int().min(1).max(20),
  par: z.number().int().min(3).max(6).optional(),
  putts: z.number().int().min(0).max(10).optional(),
  fairwayHit: z.boolean().optional(),
  greenInRegulation: z.boolean().optional(),
});

const submitRoundSchema = z.object({
  courseId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  playedAt: z.string().datetime(),
  mode: z.enum(['solo', 'match_1v1', 'match_2v2', 'tournament', 'casual']).default('solo'),
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
    const profileId = await resolveProfileId(user.id);
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
    const totalPar = body.scores.reduce((sum, h) => sum + (h.par ?? 0), 0);
    const scoreToPar = totalPar > 0 ? totalStrokes - totalPar : totalStrokes - (course.par_score ?? 72);

    // Create round
    const { data: round, error: roundErr } = await supabase
      .from('rounds')
      .insert({
        id: crypto.randomUUID(),
        user_id: profileId,
        course_id: body.courseId,
        booking_id: body.bookingId ?? null,
        played_at: body.playedAt,
        mode: body.mode,
        total_score: totalStrokes,
        score_differential: scoreToPar,
        holes_played: body.scores.length,
        verified: false,
        completed_at: new Date().toISOString(),
        notes: body.notes ?? null,
      })
      .select()
      .single();

    if (roundErr) badRequest(roundErr.message);

    // Create hole scores
    await supabase.from('hole_scores').insert(
      body.scores.map((s) => ({
        id: crypto.randomUUID(),
        round_id: round.id,
        user_id: profileId,
        hole_number: s.holeNumber,
        strokes: s.strokes,
        par: s.par ?? null,
        putts: s.putts ?? null,
        fairway_hit: s.fairwayHit ?? null,
        green_in_regulation: s.greenInRegulation ?? null,
      }))
    );

    // Trigger ranking point calculation via RPC (non-blocking)
    supabase
      .rpc('calculate_ranking_points', {
        p_user_id: profileId,
        p_round_id: round.id,
        p_score_to_par: scoreToPar,
        p_holes_played: body.scores.length,
      })
      .then(() => {})
      .catch(() => {});

    return c.json({ data: round }, 201);
  }
);

export { router as roundsRouter };
