import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { badRequest, notFound, forbidden, conflict } from '../lib/errors';

const router = new Hono();

// GET /leagues — list leagues (user is member of, or public recruiting)
router.get('/', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const { status, mine, limit, offset } = c.req.query();
  const supabase = createAdminClient();

  if (mine === 'true') {
    const { data, error } = await supabase
      .from('league_members')
      .select('leagues(*, league_members(count), courses(name))')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(Number(limit) || 20);

    if (error) badRequest(error.message);
    return c.json({ leagues: (data ?? []).map((r) => r.leagues) });
  }

  let query = supabase
    .from('leagues')
    .select('*, league_members(count), courses(name)')
    .order('created_at', { ascending: false })
    .limit(Number(limit) || 20)
    .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 20) - 1);

  if (status) query = query.eq('status', status);
  else query = query.eq('status', 'recruiting');

  const { data, error } = await query;
  if (error) badRequest(error.message);

  return c.json({ leagues: data ?? [] });
});

// GET /leagues/:id
router.get('/:id', standardRateLimit, authMiddleware, async (c) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('leagues')
    .select('*, league_members(*, users(id, display_name, avatar_url)), league_seasons(*), courses(name, address)')
    .eq('id', c.req.param('id'))
    .single();

  if (error || !data) notFound('League not found');

  return c.json({ league: data });
});

const createLeagueSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  courseId: z.string().uuid().optional(),
  maxMembers: z.number().int().min(2).max(32).default(8),
  seasonStartDate: z.string().datetime().optional(),
  seasonEndDate: z.string().datetime().optional(),
});

// POST /leagues — create league
router.post(
  '/',
  standardRateLimit,
  authMiddleware,
  zValidator('json', createLeagueSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    const { data: league, error } = await supabase
      .from('leagues')
      .insert({
        name: body.name,
        description: body.description,
        created_by_user_id: user.id,
        course_id: body.courseId,
        max_members: body.maxMembers,
        season_start_date: body.seasonStartDate,
        season_end_date: body.seasonEndDate,
        status: 'recruiting',
      })
      .select()
      .single();

    if (error) badRequest(error.message);

    // Auto-join creator as active member
    await supabase.from('league_members').insert({
      league_id: league.id,
      user_id: user.id,
      status: 'active',
    });

    return c.json({ league }, 201);
  }
);

// POST /leagues/:id/invite
const inviteSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(10),
});

router.post(
  '/:id/invite',
  standardRateLimit,
  authMiddleware,
  zValidator('json', inviteSchema),
  async (c) => {
    const user = c.get('user');
    const leagueId = c.req.param('id');
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    const { data: league } = await supabase
      .from('leagues')
      .select('created_by_user_id, max_members, status')
      .eq('id', leagueId)
      .single();

    if (!league) notFound('League not found');
    if (league.created_by_user_id !== user.id) forbidden('Only the league creator can invite');
    if (league.status !== 'recruiting') conflict('League is no longer recruiting');

    const { count: memberCount } = await supabase
      .from('league_members')
      .select('*', { count: 'exact', head: true })
      .eq('league_id', leagueId)
      .eq('status', 'active');

    if ((memberCount ?? 0) + body.userIds.length > league.max_members) {
      conflict(`League is at capacity (max ${league.max_members} members)`);
    }

    const { data, error } = await supabase
      .from('league_members')
      .upsert(
        body.userIds.map((uid) => ({
          league_id: leagueId,
          user_id: uid,
          status: 'invited',
        })),
        { onConflict: 'league_id,user_id', ignoreDuplicates: true }
      )
      .select();

    if (error) badRequest(error.message);

    return c.json({ invited: data ?? [] });
  }
);

// POST /leagues/:id/join
router.post('/:id/join', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const leagueId = c.req.param('id');
  const supabase = createAdminClient();

  const { data: invite } = await supabase
    .from('league_members')
    .select('id, status')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .single();

  if (!invite) forbidden('You have not been invited to this league');
  if (invite.status === 'active') conflict('You are already a member');

  const { data, error } = await supabase
    .from('league_members')
    .update({ status: 'active', joined_at: new Date().toISOString() })
    .eq('id', invite.id)
    .select()
    .single();

  if (error) badRequest(error.message);

  return c.json({ member: data });
});

// POST /leagues/:id/matches — submit match result
const matchResultSchema = z.object({
  player1Id: z.string().uuid(),
  player2Id: z.string().uuid(),
  score1: z.number().int().min(0),
  score2: z.number().int().min(0),
  round: z.number().int().min(1).default(1),
  scheduledAt: z.string().datetime().optional(),
  playedAt: z.string().datetime(),
  isPlayoff: z.boolean().default(false),
});

router.post(
  '/:id/matches',
  standardRateLimit,
  authMiddleware,
  zValidator('json', matchResultSchema),
  async (c) => {
    const user = c.get('user');
    const leagueId = c.req.param('id');
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    const { data: league } = await supabase
      .from('leagues')
      .select('created_by_user_id')
      .eq('id', leagueId)
      .single();

    if (!league) notFound('League not found');
    if (league.created_by_user_id !== user.id) forbidden('Only the league creator can submit match results');

    const winnerId = body.score1 > body.score2 ? body.player1Id : body.score2 > body.score1 ? body.player2Id : null;

    const { data: match, error } = await supabase
      .from('league_matches')
      .insert({
        league_id: leagueId,
        player1_id: body.player1Id,
        player2_id: body.player2Id,
        winner_id: winnerId,
        score1: body.score1,
        score2: body.score2,
        round: body.round,
        is_playoff: body.isPlayoff,
        scheduled_at: body.scheduledAt,
        played_at: body.playedAt,
      })
      .select()
      .single();

    if (error) badRequest(error.message);

    // Update member win/loss records
    if (winnerId) {
      const loserId = winnerId === body.player1Id ? body.player2Id : body.player1Id;
      await supabase.rpc('record_match_result', { league_id: leagueId, winner_id: winnerId, loser_id: loserId }).catch(() => {});
    }

    return c.json({ match }, 201);
  }
);

export { router as leaguesRouter };
