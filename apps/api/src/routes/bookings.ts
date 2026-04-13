import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { strictRateLimit, standardRateLimit } from '../middleware/rate-limit';
import { badRequest, notFound, conflict, forbidden } from '../lib/errors';

const router = new Hono();

// Helper: resolve Supabase auth UUID to users.id
async (supabase: any, supabaseUserId: string) => {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_user_id', supabaseUserId)
    .single();
  return data?.id;
};

// GET /bookings — list user's bookings
router.get('/', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const { status, limit, offset } = c.req.query();
  const supabase = createAdminClient();

  // Resolve Supabase auth ID to users.id
  const { data: userProfile } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_user_id', user.id)
    .single();

  if (!userProfile) notFound('User profile not found');

  let query = supabase
    .from('bookings')
    .select('*, tee_time_slots(starts_at, capacity), courses(name, address)')
    .eq('user_id', userProfile.id)
    .order('created_at', { ascending: false })
    .limit(Number(limit) || 20);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) badRequest(error.message);

  return c.json({ data: data ?? [] });
});

// GET /bookings/:id
router.get('/:id', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = createAdminClient();

  // Resolve Supabase auth ID to users.id
  const { data: userProfile } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_user_id', user.id)
    .single();

  if (!userProfile) notFound('User profile not found');

  const { data, error } = await supabase
    .from('bookings')
    .select('*, tee_time_slots(starts_at, capacity, price_in_cents), courses(name, address, phone_number), party_members(*)')
    .eq('id', c.req.param('id'))
    .single();

  if (error || !data) notFound('Booking not found');
  if (data.user_id !== userProfile.id) forbidden('Access denied');

  return c.json({ data });
});

const bookingCreateSchema = z.object({
  teeTimeId: z.string().uuid(),
  partySize: z.number().int().min(1).max(4).default(1),
});

// POST /bookings — create booking atomically (FREE for golfers)
router.post(
  '/',
  strictRateLimit,
  authMiddleware,
  zValidator('json', bookingCreateSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    // Resolve Supabase auth ID to users.id
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_user_id', user.id)
      .single();

    if (!userProfile) notFound('User profile not found');

    // 1. Fetch slot with availability check
    const { data: slot, error: slotErr } = await supabase
      .from('tee_time_slots')
      .select('*, courses(id, name, pricing_tier)')
      .eq('id', body.teeTimeId)
      .single();

    if (slotErr || !slot) notFound('Tee time slot not found');

    const remainingSpots = slot.capacity - slot.booked_count;
    if (remainingSpots < body.partySize) {
      conflict(`Only ${remainingSpots} spot(s) remaining for this tee time`);
    }

    // 2. Check for duplicate booking by same user on same slot
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', userProfile.id)
      .eq('slot_id', body.teeTimeId)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle();

    if (existingBooking) conflict('You already have a booking for this tee time');

    // 3. Calculate booking_fee_cents based on course's pricing_tier
    const TIER_TO_FEE: Record<string, number> = {
      standard: 275,
      basic_promotion: 225,
      active_promotion: 200,
      tournament: 175,
      founding: 150,
    };

    const bookingFeeCents = TIER_TO_FEE[slot.courses.pricing_tier] || 275;

    // 4. Create booking (FREE for golfer, fee tracks what we bill the course)
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        user_id: userProfile.id,
        slot_id: body.teeTimeId,
        course_id: slot.course_id,
        party_size: body.partySize,
        booking_fee_cents: bookingFeeCents,
        status: 'confirmed',
      })
      .select()
      .single();

    if (bookingErr) badRequest(bookingErr.message);

    // 5. Increment booked_count on slot (atomic update)
    const { error: updateErr } = await supabase.rpc('increment_booked_count', {
      slot_id: body.teeTimeId,
      increment_by: body.partySize,
    });

    // If RPC not available, do a direct update (non-atomic fallback)
    if (updateErr) {
      await supabase
        .from('tee_time_slots')
        .update({ booked_count: slot.booked_count + body.partySize })
        .eq('id', body.teeTimeId);
    }

    return c.json({ data: booking }, 201);
  }
);

const cancelSchema = z.object({
  reason: z.string().optional(),
});

// POST /bookings/:id/cancel
router.post(
  '/:id/cancel',
  standardRateLimit,
  authMiddleware,
  zValidator('json', cancelSchema),
  async (c) => {
    const user = c.get('user');
    const bookingId = c.req.param('id');
    const supabase = createAdminClient();

    // Resolve Supabase auth ID to users.id
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_user_id', user.id)
      .single();

    if (!userProfile) notFound('User profile not found');

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, tee_time_slots(starts_at, capacity)')
      .eq('id', bookingId)
      .single();

    if (error || !booking) notFound('Booking not found');
    if (booking.user_id !== userProfile.id) forbidden('Access denied');
    if (['cancelled', 'completed'].includes(booking.status)) {
      conflict(`Booking is already ${booking.status}`);
    }

    // Check cancellation window (2 hours before tee time)
    const startsAt = new Date(booking.tee_time_slots.starts_at);
    const hoursUntil = (startsAt.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil < 2) {
      conflict('Cannot cancel within 2 hours of tee time');
    }

    const { data: updated, error: updateErr } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateErr) badRequest(updateErr.message);

    // Decrement slot booked_count
    await supabase.rpc('decrement_booked_count', {
      slot_id: booking.slot_id,
      decrement_by: booking.party_size,
    }).catch(() => {
      supabase
        .from('tee_time_slots')
        .update({ booked_count: Math.max(0, booking.tee_time_slots.capacity - 1) })
        .eq('id', booking.slot_id);
    });

    return c.json({ data: updated });
  }
);

export { router as bookingsRouter };
