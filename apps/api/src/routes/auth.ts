import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { strictRateLimit } from '../middleware/rate-limit';
import { badRequest } from '../lib/errors';

const router = new Hono();

// POST /auth/verify — verify token and return user profile
router.post('/verify', strictRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = createAdminClient();

  // Upsert user profile in users table
  const { data: profile, error } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email,
        updatedAt: new Date().toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    // If upsert fails (e.g. column mismatch), just fetch existing
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    return c.json({ user: existing ?? { id: user.id, email: user.email } });
  }

  return c.json({ user: profile });
});

// GET /auth/me — return current user profile
router.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    return c.json({ user: { id: user.id, email: user.email } });
  }

  return c.json({ user: data });
});

// PATCH /auth/profile — update display name, avatar, etc.
const profileSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  avatarUrl: z.string().url().optional(),
  handicap: z.number().min(0).max(54).optional(),
  homeCourseId: z.string().uuid().optional(),
});

router.patch('/profile', authMiddleware, zValidator('json', profileSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (body.displayName !== undefined) updates['display_name'] = body.displayName;
  if (body.avatarUrl !== undefined) updates['avatar_url'] = body.avatarUrl;
  if (body.handicap !== undefined) updates['handicap'] = body.handicap;
  if (body.homeCourseId !== undefined) updates['home_course_id'] = body.homeCourseId;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) badRequest(error.message);

  return c.json({ user: data });
});

export { router as authRouter };
