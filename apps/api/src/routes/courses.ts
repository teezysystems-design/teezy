import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { notFound, badRequest, forbidden } from '../lib/errors';

const router = new Hono();

// GET /courses — list courses with optional mood filtering and next tee time
router.get('/', standardRateLimit, async (c) => {
  const supabase = createAdminClient();
  const { lat, lng, radius, mood, moodTags, includeNextTeeTime, limit, offset } = c.req.query();

  let query = supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('name')
    .limit(Number(limit) || 20)
    .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 20) - 1);

  // Support mood filtering via course_mood_tags junction table
  if (mood) {
    const moodValues = mood.split(',').filter(Boolean);
    if (moodValues.length > 0) {
      // Use subquery to filter by mood tags
      const { data: courseIds } = await supabase
        .from('course_mood_tags')
        .select('course_id')
        .in('mood_tag', moodValues);

      if (courseIds && courseIds.length > 0) {
        const ids = courseIds.map(row => row.course_id);
        query = query.in('id', ids);
      } else {
        return c.json({ data: [] });
      }
    }
  }

  // Support backward compat with moodTags JSONB column
  if (moodTags && !mood) {
    const tags = moodTags.split(',').filter(Boolean);
    if (tags.length > 0) {
      query = query.contains('mood_tags', tags);
    }
  }

  // PostGIS distance search — use RPC if lat/lng provided
  if (lat && lng) {
    const radiusM = Number(radius) || 50_000; // default 50km
    const { data, error } = await supabase.rpc('courses_within_radius', {
      lat: Number(lat),
      lng: Number(lng),
      radius_meters: radiusM,
    });
    if (error) {
      // Fall back to regular list if RPC not available
      const { data: fallback } = await query;
      return c.json({ data: fallback ?? [] });
    }

    // If includeNextTeeTime, fetch next tee time for each course
    if (includeNextTeeTime === 'true') {
      const coursesWithTeeTime = await Promise.all(
        (data ?? []).map(async (course) => {
          const { data: nextSlot } = await supabase
            .from('tee_time_slots')
            .select('id, starts_at, capacity, booked_count, price_in_cents')
            .eq('course_id', course.id)
            .gt('starts_at', new Date().toISOString())
            .lt('booked_count', 'capacity')
            .order('starts_at')
            .limit(1)
            .single();

          return {
            ...course,
            nextTeeTIme: nextSlot ? {
              id: nextSlot.id,
              startsAt: nextSlot.starts_at,
              totalCapacity: nextSlot.capacity,
              bookedCount: nextSlot.booked_count,
              remainingSpots: Math.max(0, nextSlot.capacity - nextSlot.booked_count),
              priceInCents: nextSlot.price_in_cents,
            } : null,
          };
        })
      );
      return c.json({ data: coursesWithTeeTime });
    }

    return c.json({ data: data ?? [] });
  }

  const { data, error } = await query;
  if (error) badRequest(error.message);

  // If includeNextTeeTime, fetch next tee time for each course
  if (includeNextTeeTime === 'true' && data) {
    const coursesWithTeeTime = await Promise.all(
      (data ?? []).map(async (course) => {
        const { data: nextSlot } = await supabase
          .from('tee_time_slots')
          .select('id, starts_at, capacity, booked_count, price_in_cents')
          .eq('course_id', course.id)
          .gt('starts_at', new Date().toISOString())
          .lt('booked_count', 'capacity')
          .order('starts_at')
          .limit(1)
          .single();

        return {
          ...course,
          nextTeeTime: nextSlot ? {
            id: nextSlot.id,
            startsAt: nextSlot.starts_at,
            totalCapacity: nextSlot.capacity,
            bookedCount: nextSlot.booked_count,
            remainingSpots: Math.max(0, nextSlot.capacity - nextSlot.booked_count),
            priceInCents: nextSlot.price_in_cents,
          } : null,
        };
      })
    );
    return c.json({ data: coursesWithTeeTime });
  }

  return c.json({ data: data ?? [] });
});

// GET /courses/:id
router.get('/:id', standardRateLimit, async (c) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*, course_staff(*), course_events(*)')
    .eq('id', c.req.param('id'))
    .eq('is_active', true)
    .single();

  if (error || !data) notFound('Course not found');

  return c.json({ data });
});

const courseCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  address: z.string().min(1),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  moodTags: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  photoUrls: z.array(z.string().url()).default([]),
  holeCount: z.number().int().min(9).max(18).default(18),
  parScore: z.number().int().min(27).max(90).default(72),
  websiteUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  pricingTier: z.enum(['standard', 'basic_promotion', 'active_promotion', 'tournament', 'founding']).default('standard'),
});

// POST /courses — create course (admin/staff only in prod; any authed user for now)
router.post('/', standardRateLimit, authMiddleware, zValidator('json', courseCreateSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const supabase = createAdminClient();

  // Resolve Supabase auth ID to users.id
  const { data: userProfile } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_user_id', user.id)
    .single();

  if (!userProfile) badRequest('User profile not found');

  const { data, error } = await supabase
    .from('courses')
    .insert({
      name: body.name,
      description: body.description,
      address: body.address,
      location_lat: body.locationLat,
      location_lng: body.locationLng,
      mood_tags: body.moodTags,
      amenities: body.amenities,
      photo_urls: body.photoUrls,
      hole_count: body.holeCount,
      par_score: body.parScore,
      website_url: body.websiteUrl,
      phone_number: body.phoneNumber,
      pricing_tier: body.pricingTier,
      created_by_user_id: userProfile.id,
    })
    .select()
    .single();

  if (error) badRequest(error.message);

  return c.json({ data }, 201);
});

const courseUpdateSchema = courseCreateSchema.partial();

// PATCH /courses/:id
router.patch('/:id', authMiddleware, zValidator('json', courseUpdateSchema), async (c) => {
  const user = c.get('user');
  const courseId = c.req.param('id');
  const body = c.req.valid('json');
  const supabase = createAdminClient();

  // Resolve Supabase auth ID to users.id
  const { data: userProfile } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_user_id', user.id)
    .single();

  if (!userProfile) badRequest('User profile not found');

  // Verify caller is staff for this course
  const { data: staffCheck } = await supabase
    .from('course_staff')
    .select('role')
    .eq('course_id', courseId)
    .eq('user_id', userProfile.id)
    .single();

  if (!staffCheck) forbidden('You are not a staff member of this course');

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name) updates['name'] = body.name;
  if (body.description !== undefined) updates['description'] = body.description;
  if (body.address) updates['address'] = body.address;
  if (body.locationLat !== undefined) updates['location_lat'] = body.locationLat;
  if (body.locationLng !== undefined) updates['location_lng'] = body.locationLng;
  if (body.moodTags) updates['mood_tags'] = body.moodTags;
  if (body.amenities) updates['amenities'] = body.amenities;
  if (body.photoUrls) updates['photo_urls'] = body.photoUrls;
  if (body.websiteUrl !== undefined) updates['website_url'] = body.websiteUrl;
  if (body.phoneNumber !== undefined) updates['phone_number'] = body.phoneNumber;

  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .select()
    .single();

  if (error) badRequest(error.message);

  return c.json({ data });
});

const pricingTierSchema = z.object({
  pricingTier: z.enum(['standard', 'basic_promotion', 'active_promotion', 'tournament', 'founding']),
});

// PATCH /courses/:id/pricing-tier — update pricing tier (takes effect next billing cycle)
router.patch('/:id/pricing-tier', standardRateLimit, authMiddleware, zValidator('json', pricingTierSchema), async (c) => {
  const user = c.get('user');
  const courseId = c.req.param('id');
  const { pricingTier } = c.req.valid('json');
  const supabase = createAdminClient();

  // Resolve Supabase auth ID to users.id
  const { data: userProfile } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_user_id', user.id)
    .single();

  if (!userProfile) badRequest('User profile not found');

  // Staff check — only owner/manager can change pricing tier
  const { data: staffCheck } = await supabase
    .from('course_staff')
    .select('role')
    .eq('course_id', courseId)
    .eq('user_id', userProfile.id)
    .single();

  if (!staffCheck || !['owner', 'manager'].includes(staffCheck.role)) {
    forbidden('Only course owners and managers can change the pricing tier');
  }

  // Founding tier is locked — cannot be set by a course after initial assignment
  const { data: current } = await supabase
    .from('courses')
    .select('pricing_tier')
    .eq('id', courseId)
    .single();

  if (current?.pricing_tier === 'founding' && pricingTier !== 'founding') {
    badRequest('Founding tier is locked and cannot be changed');
  }
  if (pricingTier === 'founding' && current?.pricing_tier !== 'founding') {
    badRequest('Founding tier can only be assigned by PAR-Tee staff');
  }

  // Rate change takes effect next billing cycle — record in billing_rates
  const TIER_RATES: Record<string, number> = {
    standard: 275,
    basic_promotion: 225,
    active_promotion: 200,
    tournament: 175,
    founding: 150,
  };

  const ratePerBookingCents = TIER_RATES[pricingTier] ?? 275;

  // Close out old rate record
  await supabase
    .from('billing_rates')
    .update({ effective_to: new Date().toISOString() })
    .eq('course_id', courseId)
    .is('effective_to', null);

  // Insert new rate — effective from start of next month
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  await supabase.from('billing_rates').insert({
    course_id: courseId,
    pricing_tier: pricingTier,
    rate_per_booking_cents: ratePerBookingCents,
    effective_from: nextMonth.toISOString(),
  });

  // Update pricing_tier on the course record
  const { data, error } = await supabase
    .from('courses')
    .update({ pricing_tier: pricingTier, updated_at: new Date().toISOString() })
    .eq('id', courseId)
    .select('id, name, pricing_tier')
    .single();

  if (error) badRequest(error.message);

  return c.json({ data, effectiveFrom: nextMonth.toISOString().slice(0, 10) });
});

export { router as coursesRouter };
