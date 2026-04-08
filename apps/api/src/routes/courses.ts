import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { notFound, badRequest, forbidden } from '../lib/errors';

const router = new Hono();

// GET /courses — list courses with optional PostGIS distance search
router.get('/', standardRateLimit, async (c) => {
  const supabase = createAdminClient();
  const { lat, lng, radius, moodTags, limit, offset } = c.req.query();

  let query = supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('name')
    .limit(Number(limit) || 20)
    .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 20) - 1);

  if (moodTags) {
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
      return c.json({ courses: fallback ?? [] });
    }
    return c.json({ courses: data ?? [] });
  }

  const { data, error } = await query;
  if (error) badRequest(error.message);

  return c.json({ courses: data ?? [] });
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

  return c.json({ course: data });
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
      created_by_user_id: user.id,
    })
    .select()
    .single();

  if (error) badRequest(error.message);

  return c.json({ course: data }, 201);
});

const courseUpdateSchema = courseCreateSchema.partial();

// PATCH /courses/:id
router.patch('/:id', authMiddleware, zValidator('json', courseUpdateSchema), async (c) => {
  const user = c.get('user');
  const courseId = c.req.param('id');
  const body = c.req.valid('json');
  const supabase = createAdminClient();

  // Verify caller is staff for this course
  const { data: staffCheck } = await supabase
    .from('course_staff')
    .select('role')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
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

  return c.json({ course: data });
});

export { router as coursesRouter };
