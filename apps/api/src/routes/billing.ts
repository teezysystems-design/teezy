import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '../lib/supabase';
import { getStripe, getWebhookSecret } from '../lib/stripe';
import { authMiddleware } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rate-limit';
import { badRequest, notFound, forbidden } from '../lib/errors';

const router = new Hono();

// GET /billing/invoices — list invoices for a course (staff only)
router.get('/invoices', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const { courseId, status, limit, offset } = c.req.query();
  if (!courseId) badRequest('courseId is required');

  const supabase = createAdminClient();

  // Verify caller is staff for this course
  const { data: staffCheck } = await supabase
    .from('course_staff')
    .select('role')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .single();

  if (!staffCheck) forbidden('You are not a staff member of this course');

  let query = supabase
    .from('invoices')
    .select('*, invoice_line_items(*)')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .limit(Number(limit) || 20)
    .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 20) - 1);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) badRequest(error.message);

  return c.json({ invoices: data ?? [] });
});

// GET /billing/invoices/:id
router.get('/invoices/:id', standardRateLimit, authMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = createAdminClient();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, invoice_line_items(*), courses(name, stripe_account_id)')
    .eq('id', c.req.param('id'))
    .single();

  if (error || !invoice) notFound('Invoice not found');

  // Verify caller is staff
  const { data: staffCheck } = await supabase
    .from('course_staff')
    .select('role')
    .eq('course_id', invoice.course_id)
    .eq('user_id', user.id)
    .single();

  if (!staffCheck) forbidden('Access denied');

  return c.json({ invoice });
});

const generateInvoiceSchema = z.object({
  courseId: z.string().uuid(),
  billingPeriodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  billingPeriodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// POST /billing/invoices/generate — generate invoice for a billing period
router.post(
  '/invoices/generate',
  standardRateLimit,
  authMiddleware,
  zValidator('json', generateInvoiceSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const supabase = createAdminClient();

    // Staff check
    const { data: staffCheck } = await supabase
      .from('course_staff')
      .select('role')
      .eq('course_id', body.courseId)
      .eq('user_id', user.id)
      .single();

    if (!staffCheck) forbidden('You are not a staff member of this course');

    // Fetch billing rate for course
    const { data: billingRate } = await supabase
      .from('billing_rates')
      .select('rate_per_booking_cents')
      .eq('course_id', body.courseId)
      .is('effective_to', null)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single();

    const ratePerBooking = billingRate?.rate_per_booking_cents ?? 275; // default $2.75

    // Count completed bookings in period
    const periodStart = new Date(`${body.billingPeriodStart}T00:00:00Z`).toISOString();
    const periodEnd = new Date(`${body.billingPeriodEnd}T23:59:59Z`).toISOString();

    const { data: bookings, count: bookingCount } = await supabase
      .from('bookings')
      .select('id, total_price_in_cents, tee_time_slots(starts_at)', { count: 'exact' })
      .eq('course_id', body.courseId)
      .eq('status', 'completed')
      .gte('tee_time_slots.starts_at', periodStart)
      .lte('tee_time_slots.starts_at', periodEnd);

    const count = bookingCount ?? 0;
    const subtotalCents = count * ratePerBooking;
    const taxCents = Math.round(subtotalCents * 0.05); // 5% GST
    const totalCents = subtotalCents + taxCents;

    // Create invoice
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .insert({
        course_id: body.courseId,
        billing_period_start: body.billingPeriodStart,
        billing_period_end: body.billingPeriodEnd,
        booking_count: count,
        rate_per_booking_cents: ratePerBooking,
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        status: 'draft',
      })
      .select()
      .single();

    if (invErr) badRequest(invErr.message);

    // Create line items for each booking
    if (bookings && bookings.length > 0 && invoice) {
      await supabase.from('invoice_line_items').insert(
        bookings.map((b) => ({
          invoice_id: invoice.id,
          booking_id: b.id,
          description: `Booking fee — tee time`,
          quantity: 1,
          unit_cents: ratePerBooking,
          total_cents: ratePerBooking,
        }))
      );
    }

    return c.json({ invoice }, 201);
  }
);

// POST /billing/webhook — Stripe webhook handler
router.post('/webhook', async (c) => {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecret();

  const body = await c.req.text();
  const signature = c.req.header('stripe-signature');

  if (!signature) badRequest('Missing stripe-signature header');

  let event;
  try {
    // constructEventAsync is edge-compatible (uses Web Crypto)
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook signature verification failed';
    badRequest(`Webhook error: ${msg}`);
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'invoice.paid': {
      const stripeInvoice = event.data.object as { id: string; payment_intent: string };
      await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: stripeInvoice.payment_intent,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_invoice_id', stripeInvoice.id);
      break;
    }
    case 'invoice.payment_failed': {
      const stripeInvoice = event.data.object as { id: string };
      await supabase
        .from('invoices')
        .update({ status: 'open', updated_at: new Date().toISOString() })
        .eq('stripe_invoice_id', stripeInvoice.id);
      break;
    }
    case 'invoice.voided': {
      const stripeInvoice = event.data.object as { id: string };
      await supabase
        .from('invoices')
        .update({
          status: 'void',
          voided_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_invoice_id', stripeInvoice.id);
      break;
    }
    case 'account.updated': {
      // Stripe Connect account updated — sync stripe_account_id if needed
      break;
    }
    default:
      // Unhandled event type — return 200 to acknowledge
      break;
  }

  return c.json({ received: true });
});

export { router as billingRouter };
