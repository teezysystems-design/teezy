import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { getStripe } from '../lib/stripe';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { badRequest, notFound, forbidden } from '../lib/errors';

const router = new Hono();

// GET /payments/connect/status/:courseId — check Stripe Connect account status
router.get('/connect/status/:courseId', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const courseId = c.req.param('courseId');
  const supabase = createAdminClient();

  // Verify caller is staff for this course
  const { data: staffCheck } = await supabase
    .from('course_staff')
    .select('role')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .single();

  if (!staffCheck) forbidden('You are not a staff member of this course');

  const { data: course, error } = await supabase
    .from('courses')
    .select('id, name, stripe_account_id, stripe_account_status')
    .eq('id', courseId)
    .single();

  if (error || !course) notFound('Course not found');

  // No Stripe account yet
  if (!course.stripe_account_id) {
    return c.json({ data: { connected: false, detailsSubmitted: false } });
  }

  // Check live status with Stripe
  const stripe = getStripe();
  try {
    const account = await stripe.accounts.retrieve(course.stripe_account_id);
    const connected =
      account.details_submitted &&
      account.charges_enabled &&
      !account.requirements?.disabled_reason;
    const detailsSubmitted = account.details_submitted ?? false;

    // Sync status back to DB if changed
    const newStatus = connected ? 'active' : detailsSubmitted ? 'pending' : 'incomplete';
    if (course.stripe_account_status !== newStatus) {
      await supabase
        .from('courses')
        .update({ stripe_account_status: newStatus })
        .eq('id', courseId);
    }

    return c.json({ data: { connected, detailsSubmitted } });
  } catch {
    return c.json({ data: { connected: false, detailsSubmitted: false } });
  }
});

const onboardSchema = z.object({
  courseId: z.string().uuid(),
});

// POST /payments/connect/onboard — create or resume Stripe Connect onboarding
router.post(
  '/connect/onboard',
  standardRateLimit,
  authMiddleware,
  zValidator('json', onboardSchema),
  async (c) => {
    const user = c.get('user');
    const { courseId } = c.req.valid('json');
    const supabase = createAdminClient();

    // Verify caller is owner/manager for this course
    const { data: staffCheck } = await supabase
      .from('course_staff')
      .select('role')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .single();

    if (!staffCheck || !['owner', 'manager'].includes(staffCheck.role)) {
      forbidden('Only course owners and managers can set up Stripe Connect');
    }

    const { data: course, error } = await supabase
      .from('courses')
      .select('id, name, stripe_account_id')
      .eq('id', courseId)
      .single();

    if (error || !course) notFound('Course not found');

    const stripe = getStripe();
    const baseUrl = process.env['WEB_URL'] ?? 'https://par-tee.app';
    const refreshUrl = `${baseUrl}/dashboard/connect?refresh=true`;
    const returnUrl = `${baseUrl}/dashboard/connect?success=true`;

    let accountId = course.stripe_account_id;

    // Create a new Express account if not yet created
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'CA',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: course.name,
          mcc: '7999', // Recreation services
          url: `${baseUrl}/courses/${courseId}`,
        },
      });

      accountId = account.id;

      // Persist the account ID
      await supabase
        .from('courses')
        .update({ stripe_account_id: accountId, stripe_account_status: 'incomplete' })
        .eq('id', courseId);
    }

    // Generate an onboarding link (works for both new and incomplete accounts)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return c.json({ url: accountLink.url });
  }
);

export { router as paymentsRouter };
