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

const competitiveFeatures = [
  {
    icon: '🏆',
    title: 'Real Leaderboards',
    description:
      'Track your handicap, compete in 1v1 match play, and climb the local rankings. Know exactly where you stand.',
  },
  {
    icon: '⚡',
    title: 'Challenge Nearby Golfers',
    description:
      'See who else is out there. Issue match play challenges, find scramble partners, or organize a 4-ball—no group chat needed.',
  },
  {
    icon: '📊',
    title: 'Round Analytics',
    description:
      'Score every hole, track fairways and GIR, and watch your handicap trend. Data that actually helps you improve.',
  },
  {
    icon: '🎯',
    title: 'Mood-First Booking',
    description:
      'Filter by Competitive, Social, Relaxed, or Scenic mood. Get matched to courses and tee times that fit how you want to play today.',
  },
  {
    icon: '👥',
    title: 'Tee Time Party System',
    description:
      "Invite your crew, claim a time together, and lock in a group booking instantly. No more \"who's booking?\" texts.",
  },
  {
    icon: '🌐',
    title: 'Social Feed',
    description:
      'Post round highlights, share score cards, and follow local golfers. Your golf community, not an algorithm.',
  },
];

const stats = [
  { value: '60s', label: 'Average booking time' },
  { value: '0', label: 'Phone calls required' },
  { value: '$2.75', label: 'Flat booking fee — no markups' },
  { value: '100%', label: 'Real-time tee availability' },
];

const socialProof = [
  {
    quote: "I challenged my buddy to a match play round and booked it in under two minutes. This is how golf should work.",
    name: 'Tyler B.',
    hcp: 'HCP 6',
  },
  {
    quote: "The leaderboard is addictive. I'm checking my handicap trend every week now. Finally an app that takes competition seriously.",
    name: 'Sarah M.',
    hcp: 'HCP 12',
  },
  {
    quote: "Organized a scramble with 8 guys in one shot. Group booking worked perfectly. Everyone got confirmation instantly.",
    name: 'James K.',
    hcp: 'HCP 18',
  },
];

export default function GolfersPage() {
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
            <Link href="/courses" style={{ color: COLORS.gray600, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>For Courses</Link>
            <Link href="/pricing" style={{ color: COLORS.gray600, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>Pricing</Link>
            <Link
              href="/#waitlist"
              style={{
                background: COLORS.green,
                color: COLORS.white,
                padding: '0.5rem 1.4rem',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          background: `linear-gradient(150deg, ${COLORS.gray900} 0%, #1a3a28 55%, ${COLORS.greenDark} 100%)`,
          color: COLORS.white,
          padding: '6rem 1.5rem 5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 15% 85%, rgba(26,127,75,0.25) 0%, transparent 50%), radial-gradient(circle at 85% 15%, rgba(45,184,112,0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(45,184,112,0.2)',
              border: '1px solid rgba(45,184,112,0.4)',
              padding: '0.35rem 1rem',
              borderRadius: 100,
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              letterSpacing: '0.03em',
            }}
          >
            <span>🏆</span>
            <span>Golf Is Competitive. Your Booking App Should Be Too.</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 6vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Your Tee Time.
            <br />
            <span style={{ color: COLORS.greenLight }}>Your Leaderboard.</span>
            <br />
            Your Game.
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              opacity: 0.85,
              maxWidth: 580,
              margin: '0 auto 2.5rem',
              lineHeight: 1.75,
            }}
          >
            PAR-Tee is the first golf app that treats you like a competitor — not just a customer. Book tee times, track your game, challenge friends, and climb local rankings. All in one shot.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/#waitlist"
              style={{
                display: 'inline-block',
                background: COLORS.green,
                color: COLORS.white,
                padding: '0.9rem 2.5rem',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: '1.05rem',
                boxShadow: '0 4px 24px rgba(26,127,75,0.4)',
                textDecoration: 'none',
              }}
            >
              Get Early Access — Free
            </Link>
            <Link
              href="/how-it-works"
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.1)',
                color: COLORS.white,
                padding: '0.9rem 2rem',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: '1.05rem',
                border: '1px solid rgba(255,255,255,0.25)',
                textDecoration: 'none',
              }}
            >
              How It Works →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: COLORS.green, padding: '2rem 1.5rem' }}>
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ color: COLORS.white, fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem / Solution */}
      <section style={{ padding: '5.5rem 1.5rem', background: COLORS.white }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
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
              WHY PAR-TEE
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.6rem)',
                fontWeight: 800,
                color: COLORS.gray900,
                letterSpacing: '-0.02em',
              }}
            >
              Booking apps forgot about golfers
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div
              style={{
                background: '#fff5f5',
                border: '1px solid #fed7d7',
                borderRadius: 20,
                padding: '2rem',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>❌</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.gray900, marginBottom: '0.75rem' }}>
                The old way
              </h3>
              <ul style={{ color: COLORS.gray600, fontSize: '0.95rem', lineHeight: 1.8, listStyle: 'none', padding: 0 }}>
                <li>Phone calls to book a tee time</li>
                <li>Clunky websites built in 2004</li>
                <li>No social layer — golf is lonely</li>
                <li>Zero competition features</li>
                <li>Mystery pricing and hidden fees</li>
              </ul>
            </div>
            <div
              style={{
                background: COLORS.greenPale2,
                border: `1px solid ${COLORS.greenPale}`,
                borderRadius: 20,
                padding: '2rem',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>✅</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.gray900, marginBottom: '0.75rem' }}>
                The PAR-Tee way
              </h3>
              <ul style={{ color: COLORS.gray600, fontSize: '0.95rem', lineHeight: 1.8, listStyle: 'none', padding: 0 }}>
                <li>Book in under 60 seconds, every time</li>
                <li>Mobile-first, modern, fast</li>
                <li>Challenge friends, form groups, compete</li>
                <li>Real leaderboards and handicap tracking</li>
                <li>Flat $2.75 fee. No surprises.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 1.5rem', background: COLORS.gray50 }}>
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
              FEATURES
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 800,
                color: COLORS.gray900,
                letterSpacing: '-0.02em',
              }}
            >
              Built for golfers who want more
            </h2>
            <p style={{ color: COLORS.gray600, marginTop: '0.75rem', fontSize: '1.05rem' }}>
              Competitive. Real. Yours.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {competitiveFeatures.map((f) => (
              <div
                key={f.title}
                style={{
                  background: COLORS.white,
                  borderRadius: 20,
                  padding: '2rem',
                  border: `1px solid ${COLORS.gray200}`,
                }}
              >
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
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: COLORS.gray900 }}>
                  {f.title}
                </h3>
                <p style={{ color: COLORS.gray600, fontSize: '0.93rem', lineHeight: 1.65 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '5rem 1.5rem', background: COLORS.white }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                fontWeight: 800,
                color: COLORS.gray900,
                letterSpacing: '-0.02em',
              }}
            >
              Golfers who play to win
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {socialProof.map((t) => (
              <div
                key={t.name}
                style={{
                  background: COLORS.gray50,
                  borderRadius: 20,
                  padding: '1.75rem',
                  border: `1px solid ${COLORS.gray200}`,
                }}
              >
                <div style={{ color: COLORS.green, fontSize: '1.3rem', marginBottom: '0.75rem' }}>★★★★★</div>
                <p style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: COLORS.greenPale,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: COLORS.green,
                      fontSize: '0.9rem',
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.gray900 }}>{t.name}</p>
                    <p style={{ fontSize: '0.8rem', color: COLORS.gray600 }}>{t.hcp}</p>
                  </div>
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
          background: `linear-gradient(150deg, ${COLORS.gray900} 0%, ${COLORS.greenDark} 100%)`,
          color: COLORS.white,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            Ready to compete?
          </h2>
          <p style={{ opacity: 0.85, marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Join the waitlist. Be among the first golfers in Alberta on the platform built for your game.
          </p>
          <Link
            href="/#waitlist"
            style={{
              display: 'inline-block',
              background: COLORS.green,
              color: COLORS.white,
              padding: '1rem 3rem',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 4px 24px rgba(26,127,75,0.5)',
              textDecoration: 'none',
            }}
          >
            Join the Waitlist — It&apos;s Free
          </Link>
          <p style={{ marginTop: '1rem', opacity: 0.6, fontSize: '0.85rem' }}>No spam. No credit card. Just golf.</p>
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
