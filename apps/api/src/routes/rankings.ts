import { Hono } from 'hono';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { badRequest, notFound } from '../lib/errors';

const router = new Hono();

// GET /rankings/me — caller's rank, tier, and recent points
router.get('/me', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = createAdminClient();

  const { data: ranking, error } = await supabase
    .from('player_rankings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: recentPoints } = await supabase
    .from('ranking_points')
    .select('*, rounds(played_at, total_strokes, score_to_par, courses(name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return c.json({
    ranking: ranking ?? null,
    recentPoints: recentPoints ?? [],
  });
});

// GET /rankings/user/:userId — public ranking for any user
router.get('/user/:userId', standardRateLimit, async (c) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('player_rankings')
    .select('*, users(display_name, avatar_url)')
    .eq('user_id', c.req.param('userId'))
    .single();

  if (error || !data) notFound('Ranking not found');

  return c.json({ ranking: data });
});

// GET /rankings/history — caller's monthly rank/points history (last 12 months)
router.get('/history', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = createAdminClient();

  // Aggregate points per month
  const { data: points } = await supabase
    .from('ranking_points')
    .select('points_delta, created_at, tier_after')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!points || points.length === 0) {
    return c.json({ data: [] });
  }

  // Group by year-month
  const monthly: Record<string, { points: number; tier: string }> = {};
  let running = 0;
  for (const row of points) {
    const d = new Date(row.created_at as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    running += (row.points_delta as number) ?? 0;
    monthly[key] = { points: running, tier: (row.tier_after as string) ?? 'rookie' };
  }

  const history = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, { points, tier }]) => {
      const [, m] = month.split('-');
      const label = new Date(0, Number(m) - 1).toLocaleString('en-US', { month: 'short' });
      return { label, points, tier };
    });

  return c.json({ data: history });
});

// GET /rankings/leaderboard — top players globally or by region
router.get('/leaderboard', standardRateLimit, async (c) => {
  const { tier, courseId, limit, offset } = c.req.query();
  const supabase = createAdminClient();

  let query = supabase
    .from('player_rankings')
    .select('*, users(id, display_name, avatar_url)')
    .order('total_points', { ascending: false })
    .limit(Number(limit) || 50)
    .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 50) - 1);

  if (tier) query = query.eq('tier', tier);

  const { data, error } = await query;
  if (error) badRequest(error.message);

  return c.json({
    leaderboard: (data ?? []).map((entry, idx) => ({
      rank: (Number(offset) || 0) + idx + 1,
      ...entry,
    })),
  });
});

export { router as rankingsRouter };
