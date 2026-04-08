-- Migration 0014: Stripe Connect account status on courses

-- Add stripe_account_status to courses if not already present
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS stripe_account_status TEXT
    CHECK (stripe_account_status IN ('incomplete', 'pending', 'active', 'restricted'))
    DEFAULT NULL;

-- Add index for quick status lookups
CREATE INDEX IF NOT EXISTS idx_courses_stripe_status ON courses(stripe_account_status)
  WHERE stripe_account_status IS NOT NULL;

-- Add billing_code to invoice_line_items to distinguish credit notes from charges
ALTER TABLE invoice_line_items
  ADD COLUMN IF NOT EXISTS line_type TEXT NOT NULL DEFAULT 'charge'
    CHECK (line_type IN ('charge', 'credit', 'adjustment'));

-- Track which invoices have been charged through Stripe (Connect transfer tracking)
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT UNIQUE;
