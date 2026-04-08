import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Golf Courses in Edmonton (2026 Guide) | PAR-Tee',
  description:
    'Discover the best golf courses in Edmonton, Alberta. From championship layouts to public-friendly tracks — ranked and reviewed for every type of golfer.',
  keywords: 'golf courses Edmonton, best golf Edmonton, Edmonton golf, tee times Edmonton, book golf Edmonton',
  openGraph: {
    title: 'Best Golf Courses in Edmonton (2026)',
    description: 'The definitive guide to golf in Edmonton, Alberta — ranked by course quality, accessibility, and value.',
    type: 'article',
  },
};

const COLORS = {
  green: '#1a7f4b',
  greenDark: '#155f38',
  greenLight: '#2db870',
  greenPale: '#e8f5ee',
  greenPale2: '#f0faf4',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray600: '#4b5563',
  gray700: '#374151',
  gray900: '#111827',
};

const courses = [
  {
    name: 'Windermere Golf & Country Club',
    type: 'Private/Semi-Private',
    rating: '★★★★★',
    blurb:
      "One of Edmonton's flagship courses — a stunning parkland layout that challenges low-handicappers while remaining enjoyable for recreational golfers. Rolling fairways, well-protected greens, and manicured conditioning throughout the season.",
    mood: 'Competitive / Scenic',
  },
  {
    name: 'River Ridge Golf & Country Club',
    type: 'Semi-Private',
    rating: '★★★★★',
    blurb:
      "Arguably Edmonton's most picturesque course, with dramatic elevation changes along the North Saskatchewan River valley. The back nine views alone are worth the greens fee. Challenging for all skill levels.",
    mood: 'Scenic / Competitive',
  },
  {
    name: 'The Ranch Golf & Country Club',
    type: 'Public',
    rating: '★★★★½',
    blurb:
      "A premium public-access course consistently ranked among the top in Alberta. Exceptional conditioning, strategic bunkering, and a layout that rewards shot-making. Perfect for golfers who want a serious round without a membership.",
    mood: 'Competitive',
  },
  {
    name: 'Jagare Ridge Golf Club',
    type: 'Public',
    rating: '★★★★½',
    blurb:
      'Built into the ravine landscape south of Edmonton, Jagare Ridge offers a uniquely dramatic round with over 200 feet of elevation change. No two holes feel the same. One of the most distinctive courses in the province.',
    mood: 'Scenic / Competitive',
  },
  {
    name: 'Lewis Estates Golf Course',
    type: 'Public',
    rating: '★★★★',
    blurb:
      'A well-maintained public course in the west end of Edmonton with good variety across 18 holes. Reasonable green fees, solid conditioning, and accessible booking. A reliable choice for recreational rounds and groups.',
    mood: 'Relaxed / Social',
  },
  {
    name: 'Victoria Golf Course',
    type: 'Municipal',
    rating: '★★★½',
    blurb:
      "Edmonton's oldest golf course — opened in 1907 — located along the river valley. History aside, it remains a genuinely enjoyable municipal track with character. Budget-friendly and beginner-accessible.",
    mood: 'Relaxed / Beginner-Friendly',
  },
  {
    name: 'Raven Crest Golf & Country Club',
    type: 'Public',
    rating: '★★★★',
    blurb:
      'Located just outside Edmonton, Raven Crest offers a quieter, more relaxed round with good value for the quality. Wide fairways, manageable rough, and excellent service make it a favourite for groups and casual golfers.',
    mood: 'Social / Relaxed',
  },
];

export default function BestGolfEdmontonPage() {
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
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.3rem' }}>⛳</span>
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: COLORS.green }}>PAR-Tee</span>
          </Link>
          <Link href="/#waitlist" style={{ background: COLORS.green, color: COLORS.white, padding: '0.5rem 1.4rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            Join Waitlist
          </Link>
        </div>
      </nav>

      {/* Article */}
      <article style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', fontSize: '0.85rem', color: COLORS.gray600 }}>
          <Link href="/" style={{ color: COLORS.green, textDecoration: 'none' }}>PAR-Tee</Link>
          <span>›</span>
          <Link href="/blog" style={{ color: COLORS.green, textDecoration: 'none' }}>Blog</Link>
          <span>›</span>
          <span>Best Golf Courses in Edmonton</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ display: 'inline-block', background: COLORS.greenPale, color: COLORS.green, padding: '0.2rem 0.75rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            EDMONTON GOLF GUIDE
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: COLORS.gray900, lineHeight: 1.2, marginBottom: '1rem' }}>
            Best Golf Courses in Edmonton (2026 Guide)
          </h1>
          <p style={{ color: COLORS.gray600, fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Edmonton sits inside one of the most underrated golf regions in Western Canada. The river valley, the rolling parkland, and an unusually long Alberta summer create conditions that serious golfers know and casual players are just discovering. Here are the courses worth your time.
          </p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: COLORS.gray600, flexWrap: 'wrap' }}>
            <span>📅 Updated April 2026</span>
            <span>⏱️ 8 min read</span>
            <span>⛳ 7 courses reviewed</span>
          </div>
        </div>

        {/* Intro */}
        <div style={{ background: COLORS.greenPale2, borderRadius: 16, padding: '1.5rem', marginBottom: '3rem', border: `1px solid ${COLORS.greenPale}` }}>
          <p style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.75, margin: 0 }}>
            <strong>Quick tip:</strong> Each course below is tagged with a &quot;mood&quot; — the style of round it&apos;s best suited for. When PAR-Tee launches, you&apos;ll be able to filter Edmonton tee times by mood and book instantly. <Link href="/#waitlist" style={{ color: COLORS.green, fontWeight: 600 }}>Join the waitlist</Link> to get early access.
          </p>
        </div>

        {/* Courses */}
        {courses.map((course, i) => (
          <div
            key={course.name}
            style={{
              marginBottom: '2.5rem',
              paddingBottom: '2.5rem',
              borderBottom: i < courses.length - 1 ? `1px solid ${COLORS.gray200}` : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.gray900, margin: 0 }}>
                {i + 1}. {course.name}
              </h2>
              <span style={{ color: COLORS.green, fontSize: '1rem', flexShrink: 0 }}>{course.rating}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ background: COLORS.gray50, border: `1px solid ${COLORS.gray200}`, borderRadius: 100, padding: '0.15rem 0.7rem', fontSize: '0.8rem', color: COLORS.gray600 }}>
                {course.type}
              </span>
              <span style={{ background: COLORS.greenPale, borderRadius: 100, padding: '0.15rem 0.7rem', fontSize: '0.8rem', color: COLORS.green, fontWeight: 500 }}>
                {course.mood}
              </span>
            </div>
            <p style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.75, margin: 0 }}>{course.blurb}</p>
          </div>
        ))}

        {/* Tips section */}
        <div style={{ background: COLORS.gray50, borderRadius: 20, padding: '2rem', marginBottom: '3rem', border: `1px solid ${COLORS.gray200}` }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.gray900, marginBottom: '1rem' }}>
            Tips for Booking Golf in Edmonton
          </h2>
          <ul style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 2, padding: '0 0 0 1.25rem' }}>
            <li><strong>Book early in the season:</strong> Prime weekend tee times at top Edmonton courses fill up fast in May and June. Booking 1–2 weeks ahead is standard.</li>
            <li><strong>Check the weather window:</strong> Edmonton summers are glorious but short. The best golf weather runs late May to late September.</li>
            <li><strong>Late afternoon rounds:</strong> Twilight and sunset rounds are popular in Edmonton — daylight stretches late into summer evenings.</li>
            <li><strong>River valley courses:</strong> Expect more elevation change and cart paths — bring extra layers as the valley can be 2–3 degrees cooler than the city.</li>
          </ul>
        </div>

        {/* CTA */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.greenDark}, ${COLORS.green})`,
            borderRadius: 20,
            padding: '2.5rem',
            textAlign: 'center',
            color: COLORS.white,
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⛳</div>
          <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.75rem' }}>
            Book Edmonton Golf with PAR-Tee
          </h3>
          <p style={{ opacity: 0.88, marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.65 }}>
            PAR-Tee is launching in Edmonton and Calgary. Book tee times by mood, compete with local golfers, and pay a flat $2.75 booking fee — no markups.
          </p>
          <Link
            href="/#waitlist"
            style={{
              display: 'inline-block',
              background: COLORS.white,
              color: COLORS.green,
              padding: '0.85rem 2.2rem',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            Join the Edmonton Waitlist →
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer style={{ background: COLORS.gray900, color: COLORS.gray600, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span>⛳</span>
            <p style={{ color: COLORS.white, fontWeight: 800, fontSize: '1.2rem' }}>PAR-Tee</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <Link href="/golfers" style={{ color: COLORS.gray400, fontSize: '0.88rem', textDecoration: 'none' }}>For Golfers</Link>
            <Link href="/courses" style={{ color: COLORS.gray400, fontSize: '0.88rem', textDecoration: 'none' }}>For Courses</Link>
            <Link href="/pricing" style={{ color: COLORS.gray400, fontSize: '0.88rem', textDecoration: 'none' }}>Pricing</Link>
          </div>
          <p style={{ fontSize: '0.82rem' }}>&copy; {new Date().getFullYear()} PAR-Tee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
