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
};

const courseFeatures = [
  {
    icon: '💰',
    title: 'Keep More Revenue',
    description:
      'Flat $2.75 per booking. No percentage cuts, no volume tiers, no surprises. You keep what you earn.',
  },
  {
    icon: '📅',
    title: 'Real-Time Availability',
    description:
      'Your tee sheet lives on PAR-Tee. Golfers see live availability and book instantly — no double-bookings, no manual updates.',
  },
  {
    icon: '📊',
    title: 'Course Dashboard',
    description:
      'Pro Shop and Manager views with booking analytics, revenue tracking, and golfer insights all in one place.',
  },
  {
    icon: '🏌️',
    title: 'Built-In Golfer Audience',
    description:
      'Tap into an active golfer community in Alberta. Golfers browsing by mood will discover and book your course organically.',
  },
  {
    icon: '⚡',
    title: 'Zero Setup Friction',
    description:
      'Onboard in minutes. Set your tee times, pricing, and availability. PAR-Tee handles the bookings from there.',
  },
  {
    icon: '🤝',
    title: 'Founding Rate Available',
    description:
      'Early partner courses lock in $1.50/booking — permanently. First come, first served. Limited spots.',
  },
];

const comparisons = [
  { feature: 'Booking fee per tee time', golfnow: '3–6% of greens fee', partee: '$2.75 flat' },
  { feature: 'Founding rate available', golfnow: '❌', partee: '✅ $1.50/booking' },
  { feature: 'Golfer social + competition layer', golfnow: '❌', partee: '✅ Built-in' },
  { feature: 'Real-time tee sheet sync', golfnow: 'Limited', partee: '✅ Full sync' },
  { feature: 'Course dashboard analytics', golfnow: 'Basic', partee: '✅ Pro + Manager views' },
  { feature: 'Contract lock-in', golfnow: 'Yes', partee: '❌ No contracts' },
];

const testimonials = [
  {
    quote: "GolfNow was taking a meaningful cut of every booking. PAR-Tee's flat fee structure changes the math completely for us.",
    name: 'Course Manager',
    location: 'Edmonton, AB',
  },
  {
    quote: "Setup was painless. Within an hour we had our tee sheet live and golfers were already booking. That's the kind of tech we need.",
    name: 'Pro Shop Director',
    location: 'Calgary, AB',
  },
];

export default function CoursesPage() {
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
            <Link href="/pricing" style={{ color: COLORS.gray600, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>Pricing</Link>
            <Link
              href="mailto:courses@par-tee.ca"
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
              Partner With Us
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          background: `linear-gradient(150deg, ${COLORS.greenDark} 0%, ${COLORS.green} 60%, #48bb78 100%)`,
          color: COLORS.white,
          padding: '6rem 1.5rem 5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 10% 90%, rgba(0,0,0,0.2) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(255,255,255,0.07) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(0,0,0,0.2)',
                padding: '0.35rem 1rem',
                borderRadius: 100,
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                letterSpacing: '0.03em',
              }}
            >
              <span>🏌️</span>
              <span>Built for Alberta Golf Courses</span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                lineHeight: 1.12,
                marginBottom: '1.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              More Bookings.
              <br />
              Less Commission.
              <br />
              <span style={{ opacity: 0.85 }}>No GolfNow.</span>
            </h1>
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                opacity: 0.88,
                maxWidth: 500,
                lineHeight: 1.75,
                marginBottom: '2rem',
              }}
            >
              PAR-Tee is the golf booking platform built for courses that are tired of losing 3–6% of every greens fee to third parties. Flat fee. No contracts. Golfer-first community.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href="mailto:courses@par-tee.ca"
                style={{
                  display: 'inline-block',
                  background: COLORS.white,
                  color: COLORS.green,
                  padding: '0.9rem 2.2rem',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                  textDecoration: 'none',
                }}
              >
                Become a Founding Partner
              </Link>
              <Link
                href="/pricing"
                style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.15)',
                  color: COLORS.white,
                  padding: '0.9rem 2rem',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: '1rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                }}
              >
                See Pricing →
              </Link>
            </div>
          </div>
          {/* Pricing card preview */}
          <div
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              borderRadius: 24,
              padding: '2.5rem',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <p style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.7, marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
              WHAT YOU KEEP
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.35rem' }}>$60 greens fee booking</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ opacity: 0.75, fontSize: '0.9rem' }}>GolfNow (avg 4%)</span>
                <span style={{ color: '#fca5a5', fontWeight: 600 }}>−$2.40</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.75, fontSize: '0.9rem' }}>PAR-Tee flat fee</span>
                <span style={{ color: COLORS.greenLight, fontWeight: 600 }}>−$2.75</span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '1rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>Your revenue</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: COLORS.greenLight }}>$57.25</span>
              </div>
            </div>
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 12,
                padding: '1rem',
                fontSize: '0.85rem',
                opacity: 0.9,
              }}
            >
              ⭐ Founding partners pay <strong>$1.50/booking</strong> — keep $58.50 on the same booking. Permanently.
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5.5rem 1.5rem', background: COLORS.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                display: 'inline-block',
                background: COLORS.greenPale,
                color: COLORS.green,
                padding: '0.25rem 0.85rem',
                borderRadius: 100,
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '0.85rem',
                letterSpacing: '0.04em',
              }}
            >
              PLATFORM FEATURES
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: COLORS.gray900, letterSpacing: '-0.02em' }}>
              Everything your course needs
            </h2>
            <p style={{ color: COLORS.gray600, marginTop: '0.75rem', fontSize: '1.05rem' }}>
              From tee sheet to analytics — without the GolfNow tax.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {courseFeatures.map((f) => (
              <div key={f.title} style={{ background: COLORS.gray50, borderRadius: 20, padding: '2rem', border: `1px solid ${COLORS.gray200}` }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: COLORS.greenPale,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    marginBottom: '1rem',
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: COLORS.gray900 }}>{f.title}</h3>
                <p style={{ color: COLORS.gray600, fontSize: '0.93rem', lineHeight: 1.65 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '5rem 1.5rem', background: COLORS.greenPale2 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: COLORS.gray900, letterSpacing: '-0.02em' }}>
              PAR-Tee vs. GolfNow
            </h2>
            <p style={{ color: COLORS.gray600, marginTop: '0.75rem' }}>See exactly what you gain by switching.</p>
          </div>
          <div style={{ background: COLORS.white, borderRadius: 20, border: `1px solid ${COLORS.gray200}`, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: COLORS.green, padding: '1rem 1.5rem' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>Feature</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>GolfNow</div>
              <div style={{ color: COLORS.white, fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>PAR-Tee</div>
            </div>
            {comparisons.map((row, i) => (
              <div
                key={row.feature}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  padding: '1rem 1.5rem',
                  borderBottom: i < comparisons.length - 1 ? `1px solid ${COLORS.gray100}` : 'none',
                  background: i % 2 === 0 ? COLORS.white : COLORS.gray50,
                }}
              >
                <div style={{ color: COLORS.gray700, fontSize: '0.9rem', fontWeight: 500 }}>{row.feature}</div>
                <div style={{ color: COLORS.gray600, fontSize: '0.9rem', textAlign: 'center' }}>{row.golfnow}</div>
                <div style={{ color: COLORS.green, fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>{row.partee}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 1.5rem', background: COLORS.white }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: COLORS.gray900 }}>
              Course operators agree
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{ background: COLORS.gray50, borderRadius: 20, padding: '2rem', border: `1px solid ${COLORS.gray200}` }}>
                <div style={{ color: COLORS.green, fontSize: '1.3rem', marginBottom: '0.75rem' }}>★★★★★</div>
                <p style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.gray900 }}>{t.name}</p>
                  <p style={{ fontSize: '0.82rem', color: COLORS.gray600 }}>{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '6rem 1.5rem',
          background: `linear-gradient(150deg, ${COLORS.greenDark} 0%, ${COLORS.green} 100%)`,
          color: COLORS.white,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏌️</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Become a Founding Partner
          </h2>
          <p style={{ opacity: 0.88, marginBottom: '1rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Lock in the $1.50/booking founding rate before launch. Limited to the first Alberta courses to join.
          </p>
          <p style={{ opacity: 0.7, marginBottom: '2.5rem', fontSize: '0.9rem' }}>
            No contracts. No setup fees. Cancel anytime.
          </p>
          <Link
            href="mailto:courses@par-tee.ca"
            style={{
              display: 'inline-block',
              background: COLORS.white,
              color: COLORS.green,
              padding: '1rem 3rem',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              textDecoration: 'none',
            }}
          >
            Contact Us to Partner
          </Link>
          <p style={{ marginTop: '1rem', opacity: 0.6, fontSize: '0.85rem' }}>courses@par-tee.ca</p>
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
