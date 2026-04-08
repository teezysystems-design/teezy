---
name: financial-modeling
description: >
  Financial modeling and forecasting for PAR-Tee. Use when building revenue
  projections, unit economics analysis, Stripe Connect fee modeling, pricing
  strategy, fundraising materials, or burn rate analysis.
---

# Financial Modeling and Forecasting — PAR-Tee

Revenue modeling and financial analysis for PAR-Tee's marketplace business.

## Business Model

| Revenue Stream | Mechanism | Take Rate |
|---------------|-----------|-----------|
| **Booking commission** | % of tee time price per completed booking | 10–15% |
| **League entry fees** | Stripe Connect on league registration fees | 5% platform fee |
| **Tournament entry** | Course sets entry fee; PAR-Tee takes cut | 5% platform fee |
| **Premium subscription** | Advanced stats, unlimited leagues, priority booking | $6.99/mo |

## Stripe Connect Fee Structure

PAR-Tee uses Stripe Connect (Standard accounts for courses).

```
Stripe fees:    2.9% + $0.30 per transaction
PAR-Tee take:  10% of booking value
Course nets:    ~87% of booking value (after Stripe + PAR-Tee)

Example: $60 tee time
  Stripe: $2.04  (2.9% + $0.30)
  PAR-Tee: $6.00  (10%)
  Course: $51.96
```

## Unit Economics

### Customer Acquisition Cost (CAC) Targets
- Organic/referral: $0 (league viral loop)
- Paid social (Meta/Instagram): < $8 per install
- Course partner referral: < $3 per install

### Lifetime Value (LTV) Model
```
Avg bookings/user/year:  12
Avg booking value:       $55
PAR-Tee revenue/booking: $5.50  (10%)
Annual revenue/user:     $66
3-year LTV (25% churn):  ~$148

Premium conversion (10% of users):
  $6.99/mo × 12 = $83.88/yr additional
```

### LTV:CAC Target
- Minimum: 3:1
- Target: 5:1

## Revenue Projections Template

```
Year 1 Assumptions:
  - Active courses: [X]
  - Avg tee times/course/month: [Y]
  - Booking fill rate via PAR-Tee: [Z]%
  - Avg booking value: $[N]
  - Take rate: 10%

Monthly GMV = X × Y × (Z/100) × N × 30
Monthly Revenue = GMV × 0.10
```

## Key Metrics to Track

| Metric | Definition | Target |
|--------|-----------|--------|
| GMV | Gross booking value through PAR-Tee | Growing 15%/mo early |
| Take rate | Platform revenue / GMV | 10–12% |
| Monthly Active Golfers | Users who booked in last 30 days | Growing 20%/mo |
| Booking conversion | Discover → Book | > 8% |
| Repeat booking rate | Users booking again within 30 days | > 40% |
| Course NPS | Net Promoter Score from course partners | > 40 |

## Fundraising Metrics (Seed Stage)

For a Series Seed deck targeting $1.5M at $6M pre:
- Show: MoM GMV growth, course partner count, booking conversion rate
- Comparable: GolfNow (acquired $50M+), Tagmarshal ($15M raise), Arccos ($30M raise)
- Narrative: Golf is $84B/yr US market; PAR-Tee is the social + discovery layer

## Financial Model Output Format

```markdown
## Financial Forecast: [Period]

**Assumptions:**
- [key assumption 1]
- [key assumption 2]

**Revenue:**
- Booking commissions: $[X]
- Subscriptions: $[X]
- Total: $[X]

**Costs:**
- Hosting (Vercel + Supabase): $[X]
- Stripe fees: $[X]
- Marketing: $[X]

**Burn rate / Runway:**
- Monthly burn: $[X]
- Runway at current pace: [X] months

**Key risks:** [list]
```
