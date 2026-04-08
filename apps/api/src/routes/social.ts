import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { badRequest, notFound, forbidden } from '../lib/errors';

const router = new Hono();

// GET /social/feed — personalized feed (friends + followed courses)
router.get('/feed', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const { limit, offset, before } = c.req.query();
  const supabase = createAdminClient();

  // Get friend IDs
  const { data: friendships } = await supabase
    .from('friendships')
    .select('friend_id, user_id')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq('status', 'accepted');

  const friendIds = (friendships ?? []).map((f) =>
    f.user_id === user.id ? f.friend_id : f.user_id
  );
  const authorIds = [user.id, ...friendIds];

  let query = supabase
    .from('feed_posts')
    .select(
      '*, users(id, display_name, avatar_url), post_likes(user_id), post_comments(id, body, users(display_name, avatar_url), created_at)'
    )
    .in('author_id', authorIds)
    .order('created_at', { ascending: false })
    .limit(Number(limit) || 20);

  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) badRequest(error.message);

  const posts = (data ?? []).map((p) => ({
    ...p,
    likeCount: p.post_likes?.length ?? 0,
    likedByMe: p.post_likes?.some((l: { user_id: string }) => l.user_id === user.id) ?? false,
    commentCount: p.post_comments?.length ?? 0,
  }));

  return c.json({ feed: posts });
});

const createPostSchema = z.object({
  body: z.string().min(1).max(2000),
  mediaUrls: z.array(z.string().url()).max(4).default([]),
  courseId: z.string().uuid().optional(),
  roundId: z.string().uuid().optional(),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
});

// POST /social/posts
router.post(
  '/posts',
  standardRateLimit,
  authMiddleware,
  zValidator('json', createPostSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        author_id: user.id,
        body: body.body,
        media_urls: body.mediaUrls,
        course_id: body.courseId,
        round_id: body.roundId,
        visibility: body.visibility,
      })
      .select('*, users(id, display_name, avatar_url)')
      .single();

    if (error) badRequest(error.message);

    return c.json({ post: data }, 201);
  }
);

// POST /social/posts/:id/like
router.post('/posts/:id/like', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const postId = c.req.param('id');
  const supabase = createAdminClient();

  // Upsert like (idempotent)
  const { error } = await supabase
    .from('post_likes')
    .upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id,user_id', ignoreDuplicates: true });

  if (error) badRequest(error.message);

  const { count } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  return c.json({ liked: true, likeCount: count ?? 0 });
});

// DELETE /social/posts/:id/like
router.delete('/posts/:id/like', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const postId = c.req.param('id');
  const supabase = createAdminClient();

  await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);

  const { count } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  return c.json({ liked: false, likeCount: count ?? 0 });
});

const commentSchema = z.object({
  body: z.string().min(1).max(1000),
});

// POST /social/posts/:id/comments
router.post(
  '/posts/:id/comments',
  standardRateLimit,
  authMiddleware,
  zValidator('json', commentSchema),
  async (c) => {
    const user = c.get('user');
    const postId = c.req.param('id');
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, author_id: user.id, body: body.body })
      .select('*, users(display_name, avatar_url)')
      .single();

    if (error) badRequest(error.message);

    return c.json({ comment: data }, 201);
  }
);

// GET /social/posts/:id/comments
router.get('/posts/:id/comments', standardRateLimit, async (c) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('post_comments')
    .select('*, users(id, display_name, avatar_url)')
    .eq('post_id', c.req.param('id'))
    .order('created_at');

  if (error) badRequest(error.message);

  return c.json({ comments: data ?? [] });
});

// DELETE /social/posts/:id
router.delete('/posts/:id', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const postId = c.req.param('id');
  const supabase = createAdminClient();

  const { data: post } = await supabase
    .from('feed_posts')
    .select('author_id')
    .eq('id', postId)
    .single();

  if (!post) notFound('Post not found');
  if (post.author_id !== user.id) forbidden('Access denied');

  await supabase.from('feed_posts').delete().eq('id', postId);

  return c.json({ deleted: true });
});

export { router as socialRouter };
