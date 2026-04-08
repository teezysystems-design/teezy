import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Golf Courses in Calgary (2026 Guide) | PAR-Tee',
  description:
    'The top golf courses in Calgary, Alberta — ranked for course quality, conditions, and value. From championship tracks to great public courses.',
  keywords: 'golf courses Calgary, best golf Calgary, Calgary golf, tee times Calgary, book golf Calgary Alberta',
  openGraph: {
    title: 'Best Golf Courses in Calgary (2026)',
    description: 'Ranked and reviewed: the best places to play golf in Calgary and the surrounding area.',
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
    name: 'Priddis Greens Golf & Country Club',
    type: 'Semi-Private',
    rating: '★★★★★',
    blurb:
      "Located 30 minutes southwest of Calgary, Priddis Greens offers one of the most visually stunning rounds in Alberta. Foothills topography, Rockies backdrop, and championship-caliber conditions. A legitimate bucket-list course for Alberta golfers.",
    mood: 'Scenic / Competitive',
  },
  {
    name: 'Springbank Links Golf Club',
    type: 'Public',
    rating: '★★★★★',
    blurb:
      "A links-style course that feels unlike anything else in Calgary. Open fairways, pot bunkers, and firm conditions that reward ground game and shot creativity. One of the best public-access courses in the province.",
    mood: 'Competitive',
  },
  {
    name: 'Elbow Springs Golf Club',
    type: 'Semi-Private',
    rating: '★★★★½',
    blurb:
      "Two distinct 18-hole courses with mountain views throughout. The Foothills and Meadows courses offer different challenges while maintaining excellent conditions. A top choice for serious golfers who want options in one facility.",
    mood: 'Competitive / Scenic',
  },
  {
    name: 'Country Hills Golf Club',
    type: 'Semi-Private',
    rating: '★★★★½',
    blurb:
      "Host of multiple Alberta Golf Association events, Country Hills is among the top-ranked semi-private courses in Calgary. Demanding enough to challenge scratch golfers, well-maintained, and consistently well-run.",
    mood: 'Competitive',
  },
  {
    name: 'Bearspaw Country Club',
    type: 'Semi-Private',
    rating: '★★★★',
    blurb:
      "Rolling Bearspaw terrain with tree-lined fairways and generous greens. A classic parkland design with genuine character. The 19th hole clubhouse experience adds to the overall package.",
    mood: 'Social / Relaxed',
  },
  {
    name: 'McCall Lake Golf Course',
    type: 'Municipal',
    rating: '★★★½',
    blurb:
      "Calgary's most accessible municipal course and a genuine city gem. Located in the northeast, McCall Lake is flat and beginner-friendly with affordable greens fees. A go-to for first-timers and casual rounds.",
    mood: 'Beginner-Friendly / Relaxed',
  },
  {
    name: 'Lott Creek Golf Club',
    type: 'Public',
    rating: '★★★½',
    blurb:
      "A newer addition to the Calgary golf scene with a focus on pace of play and accessibility. Good value, friendly staff, and an increasingly popular destination for recreational golfers in the southwest.",
    mood: 'Social / Fast-Paced',
  },
];

export default function BestGolfCalgaryPage() {
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

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', fontSize: '0.85rem', color: COLORS.gray600 }}>
          <Link href="/" style={{ color: COLORS.green, textDecoration: 'none' }}>PAR-Tee</Link>
          <span>›</span>
          <Link href="/blog" style={{ color: COLORS.green, textDecoration: 'none' }}>Blog</Link>
          <span>›</span>
          <span>Best Golf Courses in Calgary</span>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ display: 'inline-block', background: COLORS.greenPale, color: COLORS.green, padding: '0.2rem 0.75rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            CALGARY GOLF GUIDE
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: COLORS.gray900, lineHeight: 1.2, marginBottom: '1rem' }}>
            Best Golf Courses in Calgary (2026 Guide)
          </h1>
          <p style={{ color: COLORS.gray600, fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Calgary golfers are spoiled for choice. Backed by the Rocky Mountains and surrounded by foothills terrain, the courses around Calgary offer some of the most scenic and technically interesting golf in Western Canada. This is where to play.
          </p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: COLORS.gray600, flexWrap: 'wrap' }}>
            <span>📅 Updated April 2026</span>
            <span>⏱️ 8 min read</span>
            <span>⛳ 7 courses reviewed</span>
          </div>
        </div>

        <div style={{ background: COLORS.greenPale2, borderRadius: 16, padding: '1.5rem', marginBottom: '3rem', border: `1px solid ${COLORS.greenPale}` }}>
          <p style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.75, margin: 0 }}>
            <strong>Coming soon to Calgary:</strong> PAR-Tee lets you filter tee times by mood — Competitive, Scenic, Social, and more — and book instantly for a flat $2.75 fee. <Link href="/#waitlist" style={{ color: COLORS.green, fontWeight: 600 }}>Get on the Calgary waitlist</Link>.
          </p>
        </div>

        {courses.map((course, i) => (
          <div
            key={course.name}
            style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: i < courses.length - 1 ? `1px solid ${COLORS.gray200}` : 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.gray900, margin: 0 }}>{i + 1}. {course.name}</h2>
              <span style={{ color: COLORS.green, fontSize: '1rem', flexShrink: 0 }}>{course.rating}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ background: COLORS.gray50, border: `1px solid ${COLORS.gray200}`, borderRadius: 100, padding: '0.15rem 0.7rem', fontSize: '0.8rem', color: COLORS.gray600 }}>{course.type}</span>
              <span style={{ background: COLORS.greenPale, borderRadius: 100, padding: '0.15rem 0.7rem', fontSize: '0.8rem', color: COLORS.green, fontWeight: 500 }}>{course.mood}</span>
            </div>
            <p style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.75, margin: 0 }}>{course.blurb}</p>
          </div>
        ))}

        <div style={{ background: COLORS.gray50, borderRadius: 20, padding: '2rem', marginBottom: '3rem', border: `1px solid ${COLORS.gray200}` }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.gray900, marginBottom: '1rem' }}>
            Planning Your Calgary Golf Trip
          </h2>
          <ul style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 2, padding: '0 0 0 1.25rem' }}>
            <li><strong>Mountain courses fill fast:</strong> Foothills and mountain-view courses like Priddis book out weeks in advance in peak season (June–August). Plan accordingly.</li>
            <li><strong>Wind factor:</strong> Links-style courses like Springbank can play significantly harder on windy days — check forecasts and club up.</li>
            <li><strong>Afternoon golf:</strong> Calgary&apos;s long summer days mean 5–6pm tee times are fully playable and often half the price of morning slots.</li>
            <li><strong>Mountain views are best in the morning:</strong> Foothills haze builds through the afternoon. Morning rounds at western courses offer the clearest Rockies views.</li>
          </ul>
        </div>

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
            Book Calgary Golf with PAR-Tee
          </h3>
          <p style={{ opacity: 0.88, marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.65 }}>
            PAR-Tee launches in Edmonton and Calgary. Filter by mood, book instantly, and pay a flat $2.75 fee — no percentage markups, no hidden costs.
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
            Join the Calgary Waitlist →
          </Link>
        </div>
      </article>

      <footer style={{ background: COLORS.gray900, color: COLORS.gray600, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span>⛳</span>
            <p style={{ color: COLORS.white, fontWeight: 800, fontSize: '1.2rem' }}>PAR-Tee</p>
          </div>
          <p style={{ fontSize: '0.82rem' }}>&copy; {new Date().getFullYear()} PAR-Tee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
