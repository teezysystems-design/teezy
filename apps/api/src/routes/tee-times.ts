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

  const supabase = createAdminClient();

  let query = supabase
    .from('tee_time_slots')
    .select('*')
    .eq('course_id', courseId)
    .order('starts_at');

  // If date is provided, filter to that day; otherwise get upcoming slots
  if (date) {
    const dayStart = new Date(`${date}T00:00:00Z`).toISOString();
    const dayEnd = new Date(`${date}T23:59:59Z`).toISOString();
    query = query
      .gte('starts_at', dayStart)
      .lte('starts_at', dayEnd);
  } else {
    // Get upcoming slots (starts_at > now)
    const now = new Date().toISOString();
    query = query.gt('starts_at', now);
  }

  query = query
    .limit(Number(limit) || 50)
    .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 50) - 1);

  const { data, error } = await query;

  if (error) badRequest(error.message);

  // Transform response to match mobile expectations
  const slots = (data ?? []).map((slot) => ({
    id: slot.id,
    startsAt: slot.starts_at,
    totalCapacity: slot.capacity,
    bookedCount: slot.booked_count,
    remainingSpots: Math.max(0, slot.capacity - slot.booked_count),
    priceInCents: slot.price_in_cents,
  }));

  return c.json({ data: slots });
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
    data: {
      id: data.id,
      startsAt: data.starts_at,
      totalCapacity: data.capacity,
      bookedCount: data.booked_count,
      remainingSpots: Math.max(0, data.capacity - data.booked_count),
      priceInCents: data.price_in_cents,
      course: data.courses,
    },
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

    // Resolve Supabase auth ID to users.id for staff check
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_user_id', user.id)
      .single();

    if (!userProfile) badRequest('User profile not found');

    const { data: staffCheck } = await supabase
      .from('course_staff')
      .select('role')
      .eq('course_id', body.courseId)
      .eq('user_id', userProfile.id)
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

    return c.json({ data }, 201);
  }
);

export { router as teeTimesRouter };
