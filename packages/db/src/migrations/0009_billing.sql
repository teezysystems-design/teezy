-- Migration 0009: Billing infrastructure
-- Billing rates per pricing tier, monthly invoices, and line items

CREATE TYPE invoice_status AS ENUM ('draft', 'open', 'paid', 'void', 'uncollectable');

-- Billing rates locked at the time a contract is established
CREATE TABLE billing_rates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  pricing_tier      pricing_tier NOT NULL,
  rate_per_booking_cents INTEGER NOT NULL,
  effective_from    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, effective_from)
);

-- Monthly invoices per course
CREATE TABLE invoices (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id                 UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  billing_period_start      DATE NOT NULL,
  billing_period_end        DATE NOT NULL,
  booking_count             INTEGER NOT NULL DEFAULT 0,
  rate_per_booking_cents    INTEGER NOT NULL,
  subtotal_cents            INTEGER NOT NULL DEFAULT 0,
  tax_cents                 INTEGER NOT NULL DEFAULT 0,
  total_cents               INTEGER NOT NULL DEFAULT 0,
  status                    invoice_status NOT NULL DEFAULT 'draft',
  stripe_invoice_id         TEXT UNIQUE,
  stripe_payment_intent_id  TEXT UNIQUE,
  due_date                  DATE,
  paid_at                   TIMESTAMPTZ,
  voided_at                 TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, billing_period_start)
);

-- Individual booking line items on an invoice
CREATE TABLE invoice_line_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  booking_id    UUID REFERENCES bookings(id) ON DELETE SET NULL,
  description   TEXT NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  unit_cents    INTEGER NOT NULL,
  total_cents   INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_rates_course ON billing_rates(course_id);
CREATE INDEX idx_invoices_course ON invoices(course_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_period ON invoices(billing_period_start, billing_period_end);
CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_booking ON invoice_line_items(booking_id);
