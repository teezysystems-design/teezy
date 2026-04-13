/**
 * Notifications API — Feature 8
 *
 * Endpoints:
 *   GET    /                       — list user's notifications (paginated)
 *   GET    /unread-count           — count unread notifications
 *   POST   /:id/read               — mark notification as read
 *   POST   /mark-all-read          — mark all as read
 *   DELETE /:id                    — delete notification
 *   GET    /preferences            — get user's notification preferences
 *   PATCH  /preferences            — update preferences
 *   POST   /push-token             — register Expo push token
 *   DELETE /push-token             — unregister token
 *
 * Also exports `sendNotification()` helper used by other routes to enqueue
 * + dispatch notifications (in-app + push).
 */

import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['SUPABASE_URL'] ?? '';
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

function supabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

const app = new Hono();

// ─── Helper: resolve profile ID from auth header ────────────────────────────

async function resolveProfileId(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const sb = supabase();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await sb
    .from('users')
    .select('id')
    .eq('supabase_user_id', user.id)
    .single();
  return profile?.id ?? null;
}

// ─── Notification types ─────────────────────────────────────────────────────

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'party_invite'
  | 'party_starting'
  | 'round_finished'
  | 'rank_up'
  | 'rank_down'
  | 'league_invite'
  | 'league_match_result'
  | 'tournament_starting'
  | 'tournament_result'
  | 'social_like'
  | 'social_comment'
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'booking_cancelled';

const TYPE_TO_PREF: Record<NotificationType, string> = {
  friend_request: 'push_friend_requests',
  friend_accepted: 'push_friend_requests',
  party_invite: 'push_party_invites',
  party_starting: 'push_party_invites',
  round_finished: 'push_round_results',
  rank_up: 'push_rank_changes',
  rank_down: 'push_rank_changes',
  league_invite: 'push_league_matches',
  league_match_result: 'push_league_matches',
  tournament_starting: 'push_tournament_updates',
  tournament_result: 'push_tournament_updates',
  social_like: 'push_social_likes',
  social_comment: 'push_social_comments',
  booking_confirmed: 'push_booking_reminders',
  booking_reminder: 'push_booking_reminders',
  booking_cancelled: 'push_booking_reminders',
};

// ─── Public helper: sendNotification ────────────────────────────────────────

/**
 * Send a notification to a user. Creates the notification row in DB,
 * checks user preferences, and dispatches to Expo push if enabled.
 *
 * Designed to be fire-and-forget (await but don't block on push success).
 */
export async function sendNotification(opts: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  const sb = supabase();

  try {
    // 1. Insert notification row
    const { data: notif } = await sb
      .from('notifications')
      .insert({
        user_id: opts.userId,
        notification_type: opts.type,
        title: opts.title,
        body: opts.body,
        data: opts.data ?? {},
      })
      .select('id')
      .single();

    if (!notif) return;

    // 2. Check user preferences
    const prefKey = TYPE_TO_PREF[opts.type];
    const { data: prefs } = await sb
      .from('notification_preferences')
      .select(`${prefKey}, quiet_hours_enabled, quiet_hours_start, quiet_hours_end`)
      .eq('user_id', opts.userId)
      .single();

    const enabled = (prefs as any)?.[prefKey] !== false;
    if (!enabled) return;

    // 3. Quiet hours check
    if (prefs?.quiet_hours_enabled) {
      const now = new Date();
      const hh = now.getUTCHours().toString().padStart(2, '0') + ':' + now.getUTCMinutes().toString().padStart(2, '0');
      const start = (prefs.quiet_hours_start ?? '22:00').slice(0, 5);
      const end = (prefs.quiet_hours_end ?? '08:00').slice(0, 5);
      // Wraps midnight if start > end
      const inQuiet = start > end ? (hh >= start || hh < end) : (hh >= start && hh < end);
      if (inQuiet) return;
    }

    // 4. Get active push tokens
    const { data: tokens } = await sb
      .from('push_tokens')
      .select('expo_push_token')
      .eq('user_id', opts.userId)
      .eq('is_active', true);

    if (!tokens || tokens.length === 0) return;

    // 5. Dispatch to Expo Push API
    const messages = tokens.map((t: any) => ({
      to: t.expo_push_token,
      sound: 'default',
      title: opts.title,
      body: opts.body,
      data: { ...opts.data, notificationId: notif.id, type: opts.type },
    }));

    const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (pushRes.ok) {
      await sb.from('notifications').update({ sent_via_push: true }).eq('id', notif.id);
    }
  } catch (err) {
    console.error('sendNotification failed:', err);
  }
}

// ─── GET / — list notifications ─────────────────────────────────────────────

app.get('/', async (c) => {
  const userId = await resolveProfileId(c.req.header('authorization'));
  if (!userId) return c.json({ error: { message: 'Unauthorized' } }, 401);

  const sb = supabase();
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100);
  const before = c.req.query('before'); // cursor (created_at timestamp)

  let query = sb
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) query = query.lt('created_at', before);

  const { data: notifications, error } = await query;
  if (error) return c.json({ error: { message: error.message } }, 500);

  const formatted = (notifications ?? []).map((n: any) => ({
    id: n.id,
    type: n.notification_type,
    title: n.title,
    body: n.body,
    data: n.data ?? {},
    read: !!n.read_at,
    readAt: n.read_at,
    createdAt: n.created_at,
  }));

  return c.json({ data: formatted });
});

// ─── GET /unread-count ──────────────────────────────────────────────────────

app.get('/unread-count', async (c) => {
  const userId = await resolveProfileId(c.req.header('authorization'));
  if (!userId) return c.json({ error: { message: 'Unauthorized' } }, 401);

  const sb = supabase();
  const { count } = await sb
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  return c.json({ data: { count: count ?? 0 } });
});

// ─── POST /:id/read ─────────────────────────────────────────────────────────

app.post('/:id/read', async (c) => {
  const userId = await resolveProfileId(c.req.header('authorization'));
  if (!userId) return c.json({ error: { message: 'Unauthorized' } }, 401);

  const sb = supabase();
  await sb
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', c.req.param('id'))
    .eq('user_id', userId);

  return c.json({ data: { ok: true } });
});

// ─── POST /mark-all-read ────────────────────────────────────────────────────

app.post('/mark-all-read', async (c) => {
  const userId = await resolveProfileId(c.req.header('authorization'));
  if (!userId) return c.json({ error: { message: 'Unauthorized' } }, 401);

  const sb = supabase();
  await sb
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  return c.json({ data: { ok: true } });
});

// ─── DELETE /:id ────────────────────────────────────────────────────────────

app.delete('/:id', async (c) => {
  const userId = await resolveProfileId(c.req.header('authorization'));
  if (!userId) return c.json({ error: { message: 'Unauthorized' } }, 401);

  const sb = supabase();
  await sb
    .from('notifications')
    .delete()
    .eq('id', c.req.param('id'))
    .eq('user_id', userId);

  return c.json({ data: { ok: true } });
});

// ─── GET /preferences ───────────────────────────────────────────────────────

app.get('/preferences', async (c) => {
  const userId = await resolveProfileId(c.req.header('authorization'));
  if (!userId) return c.json({ error: { message: 'Unauthorized' } }, 401);

  const sb = supabase();
  let { data: prefs } = await sb
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Auto-create defaults if missing
  if (!prefs) {
    const { data: created } = await sb
      .from('notification_preferences')
      .insert({ user_id: userId })
      .select('*')
      .single();
    prefs = created;
  }

  return c.json({
    data: {
      pushFriendRequests: prefs?.push_friend_requests ?? true,
      pushPartyInvites: prefs?.push_party_invites ?? true,
      pushRoundResults: prefs?.push_round_results ?? true,
      pushLeagueMatches: prefs?.push_league_matches ?? true,
      pushTournamentUpdates: prefs?.push_tournament_updates ?? true,
      pushRankChanges: prefs?.push_rank_changes ?? true,
      pushSocialLikes: prefs?.push_social_likes ?? false,
      pushSocialComments: prefs?.push_social_comments ?? true,
      pushBookingReminders: prefs?.push_booking_reminders ?? true,
      quietHoursEnabled: prefs?.quiet_hours_enabled ?? false,
      quietHoursStart: prefs?.quiet_hours_start ?? '22:00',
      quietHoursEnd: prefs?.quiet_hours_end ?? '08:00',
    },
  });
});

// ─── PATCH /preferences ─────────────────────────────────────────────────────

app.patch('/preferences', async (c) => {
  const userId = await resolveProfileId(c.req.header('authorization'));
  if (!userId) return c.json({ error: { message: 'Unauthorized' } }, 401);

  const body = await c.req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  const fieldMap: Record<string, string> = {
    pushFriendRequests: 'push_friend_requests',
    pushPartyInvites: 'push_party_invites',
    pushRoundResults: 'push_round_results',
    pushLeagueMatches: 'push_league_matches',
    pushTournamentUpdates: 'push_tournament_updates',
    pushRankChanges: 'push_rank_changes',
    pushSocialLikes: 'push_social_likes',
    pushSocialComments: 'push_social_comments',
    pushBookingReminders: 'push_booking_reminders',
    quietHoursEnabled: 'quiet_hours_enabled',
    quietHoursStart: 'quiet_hours_start',
    quietHoursEnd: 'quiet_hours_end',
  };

  for (const [k, v] of Object.entries(body)) {
    if (fieldMap[k] !== undefined) updates[fieldMap[k]] = v;
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ data: { ok: true } });
  }

  updates['updated_at'] = new Date().toISOString();

  const sb = supabase();
  await sb
    .from('notification_preferences')
    .upsert({ user_id: userId, ...updates });

  return c.json({ data: { ok: true } });
});

// ─── POST /push-token ───────────────────────────────────────────────────────

app.post('/push-token', async (c) => {
  const userId = await resolveProfileId(c.req.header('authorization'));
  if (!userId) return c.json({ error: { message: 'Unauthorized' } }, 401);

  const body = await c.req.json().catch(() => ({}));
  const { expoPushToken, deviceType, deviceName } = body;
  if (!expoPushToken) return c.json({ error: { message: 'expoPushToken required' } }, 400);

  const sb = supabase();
  await sb
    .from('push_tokens')
    .upsert({
      user_id: userId,
      expo_push_token: expoPushToken,
      device_type: deviceType ?? null,
      device_name: deviceName ?? null,
      is_active: true,
      last_used_at: new Date().toISOString(),
    }, { onConflict: 'user_id,expo_push_token' });

  return c.json({ data: { ok: true } });
});

// ─── DELETE /push-token ─────────────────────────────────────────────────────

app.delete('/push-token', async (c) => {
  const userId = await resolveProfileId(c.req.header('authorization'));
  if (!userId) return c.json({ error: { message: 'Unauthorized' } }, 401);

  const body = await c.req.json().catch(() => ({}));
  const { expoPushToken } = body;
  if (!expoPushToken) return c.json({ error: { message: 'expoPushToken required' } }, 400);

  const sb = supabase();
  await sb
    .from('push_tokens')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('expo_push_token', expoPushToken);

  return c.json({ data: { ok: true } });
});

export default app;
