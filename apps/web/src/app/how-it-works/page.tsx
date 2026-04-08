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

const golferSteps = [
  {
    number: '01',
    title: 'Download & Create Your Profile',
    description:
      'Get PAR-Tee on iOS or Android. Set up your golfer profile: handicap, home city, and playing preferences. Takes about 2 minutes.',
    detail: 'Your profile powers the mood matching engine — the more accurate, the better your course recommendations.',
  },
  {
    number: '02',
    title: 'Choose Your Mood',
    description:
      "Before you search, tell us how you want to play today. Competitive, Relaxed, Social, Scenic, Beginner-Friendly, or Fast-Paced — pick the vibe that matches your energy.",
    detail: 'PAR-Tee filters available tee times based on course tags that match your selected mood.',
  },
  {
    number: '03',
    title: 'Browse Matched Courses',
    description:
      "See courses near you that match your mood, with real-time availability. No phantom tee times — if it's showing, it's available.",
    detail: 'Each course shows the greens fee, course rating, and distance from you. Sort by time, price, or distance.',
  },
  {
    number: '04',
    title: 'Pick Your Tee Time',
    description:
      'Select a time that works. If you want to play with friends, invite them right here — they get a link to join your group booking.',
    detail: 'Group bookings (up to 4 golfers) are handled in one transaction. Each golfer pays their own share.',
  },
  {
    number: '05',
    title: 'Pay & Confirm',
    description:
      'Pay securely via Apple Pay, Google Pay, or card. You see the full cost upfront: greens fee + $2.75 flat PAR-Tee fee. No surprises.',
    detail: 'Confirmation lands instantly in the app and via email. The course receives your booking in real time.',
  },
  {
    number: '06',
    title: 'Play. Track. Compete.',
    description:
      "Show up, play your round. After the round, log your score, update your handicap, and see how you rank among local golfers.",
    detail: 'Your round stats feed into the leaderboard. Challenge other golfers, review your trends, and plan your next round.',
  },
];

const courseSteps = [
  {
    number: '01',
    title: 'Submit a Partner Application',
    description:
      'Email courses@par-tee.ca to start the onboarding process. A PAR-Tee team member sets up your course profile within 24 hours.',
    detail: 'Founding Partner spots are limited. Apply early to lock in the $1.50/booking rate.',
  },
  {
    number: '02',
    title: 'Configure Your Tee Sheet',
    description:
      "Set your available tee times, pricing per time slot, and course mood tags. PAR-Tee's dashboard is built for Pro Shop staff — simple and fast.",
    detail: 'Courses can configure pricing per slot, blackout dates, group restrictions, and seasonal rates directly in the dashboard.',
  },
  {
    number: '03',
    title: 'Go Live on the Platform',
    description:
      "Once your tee sheet is configured, your course is discoverable by golfers searching in your area. You control what's available.",
    detail: 'Golfers searching by mood will see your course if it matches their selected tags. The more moods you tag, the broader your reach.',
  },
  {
    number: '04',
    title: 'Receive Bookings Instantly',
    description:
      'Every booking triggers an instant notification to your Pro Shop dashboard. Golfer name, tee time, group size, and payment confirmation — all in one view.',
    detail: 'The Pro Shop View is designed for front-desk staff. Manager View shows the analytics layer: revenue trends, peak booking windows, and more.',
  },
  {
    number: '05',
    title: 'Get Paid Automatically',
    description:
      "Stripe Connect powers your payout. PAR-Tee deducts the flat booking fee and deposits the remainder to your bank within 2 business days.",
    detail: 'No manual invoicing. No waiting for platform cheques. Payouts are automatic after each confirmed booking.',
  },
];

export default function HowItWorksPage() {
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
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
              fontWeight: 800,
              color: COLORS.gray900,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            How PAR-Tee Works
          </h1>
          <p style={{ fontSize: '1.1rem', color: COLORS.gray600, lineHeight: 1.7 }}>
            Whether you&apos;re a golfer booking a round or a course listing tee times — here&apos;s exactly how it works.
          </p>
        </div>
        {/* Tab-like anchors */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <a
            href="#golfers"
            style={{
              background: COLORS.green,
              color: COLORS.white,
              padding: '0.6rem 1.75rem',
              borderRadius: 100,
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            For Golfers
          </a>
          <a
            href="#courses"
            style={{
              background: COLORS.white,
              color: COLORS.green,
              padding: '0.6rem 1.75rem',
              borderRadius: 100,
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              border: `2px solid ${COLORS.green}`,
            }}
          >
            For Courses
          </a>
        </div>
      </section>

      {/* Golfer Steps */}
      <section id="golfers" style={{ padding: '5.5rem 1.5rem', background: COLORS.white }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
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
              FOR GOLFERS
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.4rem)', fontWeight: 800, color: COLORS.gray900, letterSpacing: '-0.02em' }}>
              From mood to tee box in minutes
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {golferSteps.map((step, i) => (
              <div
                key={step.number}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: i === 0 ? COLORS.green : COLORS.greenPale,
                    color: i === 0 ? COLORS.white : COLORS.green,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0,
                  }}
                >
                  {step.number}
                </div>
                <div style={{ background: COLORS.gray50, borderRadius: 16, padding: '1.5rem', border: `1px solid ${COLORS.gray200}` }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: COLORS.gray900, marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>{step.description}</p>
                  <p style={{ color: COLORS.gray500, fontSize: '0.85rem', lineHeight: 1.65, borderTop: `1px solid ${COLORS.gray200}`, paddingTop: '0.75rem' }}>
                    💡 {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link
              href="/#waitlist"
              style={{
                display: 'inline-block',
                background: COLORS.green,
                color: COLORS.white,
                padding: '0.9rem 2.5rem',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              Join the Golfer Waitlist →
            </Link>
          </div>
        </div>
      </section>

      {/* Course Steps */}
      <section id="courses" style={{ padding: '5.5rem 1.5rem', background: COLORS.greenPale2 }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
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
              FOR GOLF COURSES
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.4rem)', fontWeight: 800, color: COLORS.gray900, letterSpacing: '-0.02em' }}>
              Live and taking bookings in under an hour
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {courseSteps.map((step, i) => (
              <div
                key={step.number}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: i === 0 ? COLORS.green : COLORS.white,
                    color: i === 0 ? COLORS.white : COLORS.green,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0,
                    border: i !== 0 ? `2px solid ${COLORS.green}` : 'none',
                  }}
                >
                  {step.number}
                </div>
                <div style={{ background: COLORS.white, borderRadius: 16, padding: '1.5rem', border: `1px solid ${COLORS.gray200}` }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: COLORS.gray900, marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>{step.description}</p>
                  <p style={{ color: COLORS.gray500, fontSize: '0.85rem', lineHeight: 1.65, borderTop: `1px solid ${COLORS.gray100}`, paddingTop: '0.75rem' }}>
                    💡 {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link
              href="mailto:courses@par-tee.ca"
              style={{
                display: 'inline-block',
                background: COLORS.green,
                color: COLORS.white,
                padding: '0.9rem 2.5rem',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              Become a Course Partner →
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
