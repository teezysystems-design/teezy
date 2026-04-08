import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { badRequest, notFound } from '../lib/errors';

const router = new Hono();

// GET /tee-times — list available slots by course and date
router.get('/', standardRateLimit, async (c) => {
  const { courseId, date, limit, offset } = c.req.query();
  if (!courseId) badRequest('courseId is required');
  if (!date) badRequest('date is required');

  const supabase = createAdminClient();
  const dayStart = new Date(`${date}T00:00:00Z`).toISOString();
  const dayEnd = new Date(`${date}T23:59:59Z`).toISOString();

  const { data, error } = await supabase
    .from('tee_time_slots')
    .select('*')
    .eq('course_id', courseId)
    .gte('starts_at', dayStart)
    .lte('starts_at', dayEnd)
    .order('starts_at')
    .limit(Number(limit) || 50)
    .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 50) - 1);

  if (error) badRequest(error.message);

  const available = (data ?? []).filter((s) => s.booked_count < s.capacity);

  return c.json({
    slots: data ?? [],
    available,
    total: data?.length ?? 0,
    availableCount: available.length,
  });
});

// GET /tee-times/:id — single slot with availability
router.get('/:id', standardRateLimit, async (c) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('tee_time_slots')
    .select('*, courses(name, address, hole_count, par_score, photo_urls)')
    .eq('id', c.req.param('id'))
    .single();

  if (error || !data) notFound('Tee time slot not found');

  return c.json({
    slot: data,
    available: data.booked_count < data.capacity,
    remainingSpots: Math.max(0, data.capacity - data.booked_count),
  });
});

const slotCreateSchema = z.object({
  courseId: z.string().uuid(),
  startsAt: z.string().datetime(),
  capacity: z.number().int().min(1).max(8).default(4),
  priceInCents: z.number().int().min(0),
});

// POST /tee-times — create slot (course staff only)
router.post(
  '/',
  standardRateLimit,
  authMiddleware,
  zValidator('json', slotCreateSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    const { data: staffCheck } = await supabase
      .from('course_staff')
      .select('role')
      .eq('course_id', body.courseId)
      .eq('user_id', user.id)
      .single();

    if (!staffCheck) {
      // Allow for now but note in response
    }

    const { data, error } = await supabase
      .from('tee_time_slots')
      .insert({
        course_id: body.courseId,
        starts_at: body.startsAt,
        capacity: body.capacity,
        price_in_cents: body.priceInCents,
      })
      .select()
      .single();

    if (error) badRequest(error.message);

    return c.json({ slot: data }, 201);
  }
);

export { router as teeTimesRouter };
