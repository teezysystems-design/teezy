import Link from 'next/link';

const COLORS = {
  green: '#1a7f4b',
  greenDark: '#155f38',
  greenLight: '#2db870',
  greenPale: '#e8f5ee',
  greenPale2: '#f0faf4',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  amber: '#f59e0b',
  amberPale: '#fffbeb',
};

const golferPricing = [
  { label: 'App download', value: 'Free' },
  { label: 'Account creation', value: 'Free' },
  { label: 'Browse courses & tee times', value: 'Free' },
  { label: 'Social feed & leaderboards', value: 'Free' },
  { label: 'Booking fee per tee time', value: '$2.75' },
  { label: 'Cancellation fee', value: 'None' },
  { label: 'Hidden fees', value: 'None. Ever.' },
];

const coursePlans = [
  {
    name: 'Standard',
    price: '$2.75',
    period: 'per booking',
    description: 'For courses joining after launch.',
    highlight: false,
    features: [
      'Unlimited tee time listings',
      'Real-time tee sheet sync',
      'Course dashboard (Pro Shop + Manager)',
      'Booking analytics',
      'Golfer discovery via mood matching',
      'Instant payout — net of fee',
      'No monthly subscription',
      'No contracts',
    ],
  },
  {
    name: 'Founding Partner',
    price: '$1.50',
    period: 'per booking — forever',
    description: 'Lock in before launch. Limited spots.',
    highlight: true,
    badge: '⭐ Early Access',
    features: [
      'Everything in Standard',
      '$1.50/booking rate locked in permanently',
      'Priority onboarding support',
      'First-mover listing placement',
      'Founding Partner badge on course profile',
      'Direct input on product roadmap',
      'No contracts — cancel anytime',
    ],
  },
];

const faqs = [
  {
    q: 'Is there a monthly subscription or setup fee?',
    a: 'No. PAR-Tee charges only per confirmed booking. No monthly fees, no setup costs, no commitment.',
  },
  {
    q: "What's the difference between Standard and Founding Partner?",
    a: 'The booking fee. Standard courses pay $2.75 per booking. Founding Partners pay $1.50 — permanently. The founding rate never increases and is locked in at signup, regardless of future pricing changes.',
  },
  {
    q: 'How does payout work?',
    a: 'Golfers pay the full greens fee at booking via Stripe. PAR-Tee deducts the flat fee and deposits the remainder to your linked bank account within 2 business days.',
  },
  {
    q: 'Can golfers cancel? What happens to the fee?',
    a: 'Courses set their own cancellation policies. PAR-Tee returns the full greens fee to the golfer on cancellation. The booking fee is waived on cancellations.',
  },
  {
    q: 'How many Founding Partner spots are available?',
    a: "We're limiting founding rate access to the first 20 Alberta courses to partner before public launch. Once those spots are filled, new courses join at the Standard $2.75 rate.",
  },
  {
    q: 'What does PAR-Tee charge golfers?',
    a: 'Golfers pay a flat $2.75 booking fee on top of the course greens fee. No hidden markups, no dynamic pricing. What the course charges is what golfers see.',
  },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.white }}>
      {/* Nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${COLORS.gray200}`,
          padding: '0 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.3rem' }}>⛳</span>
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: COLORS.green }}>PAR-Tee</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/golfers" style={{ color: COLORS.gray600, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>For Golfers</Link>
            <Link href="/courses" style={{ color: COLORS.gray600, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>For Courses</Link>
            <Link
              href="/#waitlist"
              style={{
                background: COLORS.green,
                color: COLORS.white,
                padding: '0.5rem 1.4rem',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '5rem 1.5rem 4rem', textAlign: 'center', background: COLORS.greenPale2 }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <span
            style={{
              display: 'inline-block',
              background: COLORS.greenPale,
              color: COLORS.green,
              padding: '0.25rem 0.85rem',
              borderRadius: 100,
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '1rem',
              letterSpacing: '0.04em',
            }}
          >
            TRANSPARENT PRICING
          </span>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
              fontWeight: 800,
              color: COLORS.gray900,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Simple. Flat. No Surprises.
          </h1>
          <p style={{ fontSize: '1.1rem', color: COLORS.gray600, lineHeight: 1.7 }}>
            One fee per booking — for everyone. Golfers know exactly what they pay. Courses keep more of every tee time.
          </p>
        </div>
      </section>

      {/* Golfer Pricing */}
      <section style={{ padding: '5rem 1.5rem', background: COLORS.white }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, color: COLORS.gray900 }}>
              For Golfers
            </h2>
            <p style={{ color: COLORS.gray600, marginTop: '0.5rem' }}>Free to join. Pay only when you book.</p>
          </div>
          <div style={{ background: COLORS.gray50, borderRadius: 24, border: `1px solid ${COLORS.gray200}`, overflow: 'hidden' }}>
            {golferPricing.map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  borderBottom: i < golferPricing.length - 1 ? `1px solid ${COLORS.gray200}` : 'none',
                  background: i % 2 === 0 ? COLORS.white : COLORS.gray50,
                }}
              >
                <span style={{ color: COLORS.gray700, fontSize: '0.95rem' }}>{item.label}</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: item.value === '$2.75' ? COLORS.green : item.value === 'None. Ever.' ? COLORS.green : COLORS.gray900,
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: COLORS.gray600, fontSize: '0.9rem' }}>
            The $2.75 fee is shown upfront at checkout — no surprises.
          </p>
        </div>
      </section>

      {/* Course Pricing */}
      <section style={{ padding: '5rem 1.5rem', background: COLORS.gray50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, color: COLORS.gray900 }}>
              For Golf Courses
            </h2>
            <p style={{ color: COLORS.gray600, marginTop: '0.5rem' }}>No monthly fees. No contracts. Pay per confirmed booking.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {coursePlans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: plan.highlight ? COLORS.green : COLORS.white,
                  borderRadius: 24,
                  padding: '2.5rem',
                  border: plan.highlight ? 'none' : `1px solid ${COLORS.gray200}`,
                  position: 'relative',
                  boxShadow: plan.highlight ? '0 8px 40px rgba(26,127,75,0.3)' : 'none',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: COLORS.amber,
                      color: COLORS.white,
                      padding: '0.25rem 1rem',
                      borderRadius: 100,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: plan.highlight ? COLORS.white : COLORS.gray900, marginBottom: '0.5rem' }}>
                  {plan.name}
                </h3>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: plan.highlight ? COLORS.white : COLORS.gray900 }}>
                    {plan.price}
                  </span>
                  <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.75)' : COLORS.gray600, fontSize: '0.9rem', marginLeft: '0.35rem' }}>
                    {plan.period}
                  </span>
                </div>
                <p style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : COLORS.gray600, fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                  {plan.description}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                        marginBottom: '0.75rem',
                        color: plan.highlight ? 'rgba(255,255,255,0.9)' : COLORS.gray700,
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ color: plan.highlight ? COLORS.greenLight : COLORS.green, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="mailto:courses@par-tee.ca"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: '2rem',
                    background: plan.highlight ? COLORS.white : COLORS.green,
                    color: plan.highlight ? COLORS.green : COLORS.white,
                    padding: '0.85rem',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                  }}
                >
                  {plan.highlight ? 'Claim Founding Rate →' : 'Get Started →'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '5rem 1.5rem', background: COLORS.white }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, color: COLORS.gray900 }}>
              Pricing FAQ
            </h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  padding: '1.5rem 0',
                  borderBottom: i < faqs.length - 1 ? `1px solid ${COLORS.gray200}` : 'none',
                }}
              >
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: COLORS.gray900, marginBottom: '0.6rem' }}>{faq.q}</h3>
                <p style={{ color: COLORS.gray600, fontSize: '0.93rem', lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '5rem 1.5rem',
          background: `linear-gradient(150deg, ${COLORS.greenDark} 0%, ${COLORS.green} 100%)`,
          color: COLORS.white,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to tee off?
          </h2>
          <p style={{ opacity: 0.88, marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Golfers: join the waitlist for early access. Courses: contact us to become a Founding Partner.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/#waitlist"
              style={{
                display: 'inline-block',
                background: COLORS.white,
                color: COLORS.green,
                padding: '0.9rem 2.2rem',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              Join Golfer Waitlist
            </Link>
            <Link
              href="mailto:courses@par-tee.ca"
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.15)',
                color: COLORS.white,
                padding: '0.9rem 2.2rem',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.3)',
                textDecoration: 'none',
              }}
            >
              Partner Your Course
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: COLORS.gray900, color: COLORS.gray600, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⛳</span>
            <p style={{ color: COLORS.white, fontWeight: 800, fontSize: '1.2rem' }}>PAR-Tee</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <Link href="/golfers" style={{ color: COLORS.gray400, fontSize: '0.88rem', textDecoration: 'none' }}>For Golfers</Link>
            <Link href="/courses" style={{ color: COLORS.gray400, fontSize: '0.88rem', textDecoration: 'none' }}>For Courses</Link>
            <Link href="/pricing" style={{ color: COLORS.gray400, fontSize: '0.88rem', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/privacy" style={{ color: COLORS.gray400, fontSize: '0.88rem', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: COLORS.gray400, fontSize: '0.88rem', textDecoration: 'none' }}>Terms</Link>
          </div>
          <p style={{ fontSize: '0.82rem' }}>&copy; {new Date().getFullYear()} PAR-Tee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
