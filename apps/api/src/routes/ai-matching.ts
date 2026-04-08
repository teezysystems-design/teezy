import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { strictRateLimit } from '../middleware/rate-limit';
import { badRequest } from '../lib/errors';

const router = new Hono();

const moodMatchSchema = z.object({
  prompt: z.string().min(5).max(500),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().min(1).max(500).default(50),
  limit: z.number().int().min(1).max(10).default(5),
});

// POST /ai-matching/mood — mood prompt → Claude API → course recommendations
router.post(
  '/mood',
  strictRateLimit,
  authMiddleware,
  zValidator('json', moodMatchSchema),
  async (c) => {
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    // Fetch available courses (with location + mood tags)
    let coursesQuery = supabase
      .from('courses')
      .select('id, name, description, address, mood_tags, amenities, hole_count, par_score, location_lat, location_lng')
      .eq('is_active', true)
      .limit(100);

    const { data: courses } = await coursesQuery;
    if (!courses || courses.length === 0) {
      return c.json({ courses: [], reasoning: 'No courses available' });
    }

    // Build course list for Claude
    const courseList = courses
      .map(
        (c) =>
          `ID:${c.id} | ${c.name} | ${c.address} | Holes:${c.hole_count} | Par:${c.par_score} | Tags:${(c.mood_tags as string[] || []).join(',')}`
      )
      .join('\n');

    const systemPrompt = `You are a golf course recommendation engine for PAR-Tee.
Given a golfer's mood/preference description and a list of available courses, return the top ${body.limit} most suitable course IDs.
Respond with ONLY a JSON object: { "courseIds": ["id1", "id2", ...], "reasoning": "brief explanation" }
Consider: mood tags match, difficulty (hole count, par), vibe keywords in description, and amenities.`;

    const userMessage = `Golfer's mood/request: "${body.prompt}"

Available courses:
${courseList}

Return the top ${body.limit} best matches.`;

    let reasoning = 'AI matching unavailable';
    let recommendedIds: string[] = [];

    try {
      const anthropicApiKey = process.env['ANTHROPIC_API_KEY'];
      if (!anthropicApiKey) throw new Error('ANTHROPIC_API_KEY not configured');

      const anthropic = new Anthropic({ apiKey: anthropicApiKey });
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
      const parsed = JSON.parse(responseText) as { courseIds?: string[]; reasoning?: string };
      recommendedIds = (parsed.courseIds ?? []).slice(0, body.limit);
      reasoning = parsed.reasoning ?? 'Based on mood tags and course attributes';
    } catch (err) {
      // Fallback to tag-based matching if AI unavailable
      const promptLower = body.prompt.toLowerCase();
      const scored = courses.map((course) => {
        const tags = (course.mood_tags as string[] || []).map((t) => t.toLowerCase());
        const score = tags.filter((t) => promptLower.includes(t)).length;
        return { id: course.id, score };
      });
      scored.sort((a, b) => b.score - a.score);
      recommendedIds = scored.slice(0, body.limit).map((s) => s.id);
      reasoning = 'Tag-based fallback matching (AI temporarily unavailable)';
    }

    // Fetch full details for recommended courses
    const { data: recommended, error } = await supabase
      .from('courses')
      .select('*')
      .in('id', recommendedIds)
      .eq('is_active', true);

    if (error) badRequest(error.message);

    // Preserve recommended order
    const orderedCourses = recommendedIds
      .map((id) => recommended?.find((c) => c.id === id))
      .filter(Boolean);

    return c.json({
      courses: orderedCourses,
      reasoning,
      totalCandidates: courses.length,
    });
  }
);

export { router as aiMatchingRouter };
