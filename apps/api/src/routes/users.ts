import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import {
  badRequest,
  notFound,
  conflict,
  unauthorized,
} from '../lib/errors';
import { standardRateLimit, strictRateLimit } from '../middleware/rate-limit';
import { authMiddleware } from '../middleware/auth';


const app = new Hono();

// Helper function to convert snake_case DB row to camelCase
function toCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    result[camelKey] = value;
  }
  return result;
}

// Validation schemas
const usernameCheckSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,
      'Username must start with a letter and contain only letters, numbers, and underscores'
    ),
});

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,
      'Username must start with a letter and contain only letters, numbers, and underscores'
    ),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(80, 'Name must be at most 80 characters'),
  displayName: z
    .string()
    .min(1, 'Display name must be at least 1 character')
    .max(80, 'Display name must be at most 80 characters')
    .optional(),
  handicap: z
    .number()
    .min(0, 'Handicap must be at least 0')
    .max(54, 'Handicap must be at most 54')
    .optional(),
  moodPreferences: z.array(z.string()).optional(),
  bio: z
    .string()
    .max(300, 'Bio must be at most 300 characters')
    .optional(),
});

const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character')
    .max(80, 'Name must be at most 80 characters')
    .optional(),
  displayName: z
    .string()
    .min(1, 'Display name must be at least 1 character')
    .max(80, 'Display name must be at most 80 characters')
    .optional(),
  bio: z
    .string()
    .max(300, 'Bio must be at most 300 characters')
    .nullable()
    .optional(),
  handicap: z
    .number()
    .min(0, 'Handicap must be at least 0')
    .max(54, 'Handicap must be at most 54')
    .nullable()
    .optional(),
  isPrivate: z.boolean().optional(),
  moodPreferences: z.array(z.string()).optional(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL').optional(),
  homeCourseId: z.string().uuid('Home course ID must be a valid UUID').nullable().optional(),
});

// GET /users/check-username/:username
app.get(
  '/check-username/:username',
  strictRateLimit,
  zValidator('param', usernameCheckSchema),
  async (c) => {
    const { username } = c.req.valid('param');
    const client = createAdminClient();

    const { data, error } = await client
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      throw badRequest(`Database error: ${error.message}`);
    }

    return c.json({ available: !data });
  }
);

// POST /users
app.post(
  '/',
  authMiddleware,
  standardRateLimit,
  zValidator('json', createUserSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const client = createAdminClient();

    // Check username availability
    const { data: existingUser, error: checkError } = await client
      .from('users')
      .select('id')
      .eq('username', body.username.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw badRequest(`Database error: ${checkError.message}`);
    }

    if (existingUser) {
      throw conflict('Username is already taken');
    }

    // Check if user profile already exists
    const { data: profileExists, error: profileError } = await client
      .from('users')
      .select('id')
      .eq('supabase_user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw badRequest(`Database error: ${profileError.message}`);
    }

    if (profileExists) {
      throw conflict('Profile already exists for this user');
    }

    // Create the user profile
    const userId = crypto.randomUUID();
    const { data: newUser, error: insertError } = await client
      .from('users')
      .insert({
        id: userId,
        supabase_user_id: user.id,
        email: user.email,
        username: body.username.toLowerCase(),
        name: body.name,
        display_name: body.displayName || null,
        bio: body.bio || null,
        handicap: body.handicap || null,
        mood_preferences: body.moodPreferences || null,
        is_private: false,
        account_type: 'golfer',
      })
      .select()
      .single();

    if (insertError) {
      throw badRequest(`Failed to create user profile: ${insertError.message}`);
    }

    return c.json({ data: toCamelCase(newUser) }, { status: 201 });
  }
);

// GET /users/me
app.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const client = createAdminClient();

  const { data: userData, error: userError } = await client
    .from('users')
    .select('*')
    .eq('supabase_user_id', user.id)
    .single();

  if (userError || !userData) {
    throw notFound('User profile not found');
  }

  // Fetch player rankings if it exists
  const { data: ranking } = await client
    .from('player_rankings')
    .select('tier, points, rank')
    .eq('user_id', userData.id)
    .single();

  return c.json({
    data: {
      ...toCamelCase(userData),
      ranking: ranking
        ? toCamelCase(ranking)
        : null,
    },
  });
});

// PATCH /users/me
app.patch(
  '/me',
  authMiddleware,
  standardRateLimit,
  zValidator('json', updateUserSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const client = createAdminClient();

    // Look up user by supabase_user_id
    const { data: userData, error: userError } = await client
      .from('users')
      .select('id')
      .eq('supabase_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw notFound('User profile not found');
    }

    // Build update object with snake_case keys
    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.displayName !== undefined) updateData.display_name = body.displayName;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.handicap !== undefined) updateData.handicap = body.handicap;
    if (body.isPrivate !== undefined) updateData.is_private = body.isPrivate;
    if (body.moodPreferences !== undefined) updateData.mood_preferences = body.moodPreferences;
    if (body.avatarUrl !== undefined) updateData.avatar_url = body.avatarUrl;
    if (body.homeCourseId !== undefined) updateData.home_course_id = body.homeCourseId;

    const { data: updatedUser, error: updateError } = await client
      .from('users')
      .update(updateData)
      .eq('id', userData.id)
      .select()
      .single();

    if (updateError) {
      throw badRequest(`Failed to update user profile: ${updateError.message}`);
    }

    return c.json({ data: toCamelCase(updatedUser) });
  }
);

// GET /users/:userId
app.get('/:userId', authMiddleware, async (c) => {
  const { userId } = c.req.param();
  const requestingUser = c.get('user');
  const client = createAdminClient();

  // Validate userId is a UUID
  if (!userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw badRequest('Invalid user ID format');
  }

  const { data: userData, error: userError } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw notFound('User not found');
  }

  // Check if user is private and requester is not the user themselves
  if (userData.is_private && userData.supabase_user_id !== requestingUser.id) {
    // Return limited public data for private users
    return c.json({
      data: {
        id: userData.id,
        username: userData.username,
        displayName: userData.display_name,
        avatarUrl: userData.avatar_url,
      },
    });
  }

  return c.json({ data: toCamelCase(userData) });
});

export const usersRouter = app;
