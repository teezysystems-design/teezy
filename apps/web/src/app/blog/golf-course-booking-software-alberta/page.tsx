import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Golf Course Booking Software in Alberta | PAR-Tee for Courses',
  description:
    'PAR-Tee is the golf course booking software built for Alberta courses. Flat-fee per booking, real-time tee sheet, and a built-in golfer community. No GolfNow commissions.',
  keywords: 'golf course booking software Alberta, tee sheet management Alberta, GolfNow alternative Alberta, online booking golf course Alberta',
  openGraph: {
    title: 'Golf Course Booking Software for Alberta Courses',
    description: 'PAR-Tee: the booking platform built for Alberta golf courses. Flat fee, no commissions, built-in golfer audience.',
    type: 'article',
  },
};

const COLORS = {
  green: '#1a7f4b', greenDark: '#155f38',
  greenPale: '#e8f5ee', greenPale2: '#f0faf4',
  white: '#ffffff', gray50: '#f9fafb', gray200: '#e5e7eb',
  gray400: '#9ca3af', gray600: '#4b5563', gray700: '#374151', gray900: '#111827',
};

export default function GolfCourseSoftwareAlbertaPage() {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.white }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${COLORS.gray200}`, padding: '0 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.3rem' }}>⛳</span>
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: COLORS.green }}>PAR-Tee</span>
          </Link>
          <Link href="/courses" style={{ background: COLORS.green, color: COLORS.white, padding: '0.5rem 1.4rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Partner With Us</Link>
        </div>
      </nav>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', fontSize: '0.85rem', color: COLORS.gray600 }}>
          <Link href="/" style={{ color: COLORS.green, textDecoration: 'none' }}>PAR-Tee</Link>
          <span>›</span>
          <Link href="/blog" style={{ color: COLORS.green, textDecoration: 'none' }}>Blog</Link>
          <span>›</span>
          <span>Golf Course Booking Software Alberta</span>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ display: 'inline-block', background: COLORS.greenPale, color: COLORS.green, padding: '0.2rem 0.75rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            FOR COURSE OPERATORS
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: COLORS.gray900, lineHeight: 1.2, marginBottom: '1rem' }}>
            Golf Course Booking Software for Alberta Courses
          </h1>
          <p style={{ color: COLORS.gray600, fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Alberta golf courses deserve a booking platform that works for them — not against them. Here&apos;s what to look for in booking software, why existing options fall short, and how PAR-Tee was built specifically for the Alberta market.
          </p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: COLORS.gray600, flexWrap: 'wrap' }}>
            <span>📅 April 2026</span>
            <span>⏱️ 6 min read</span>
          </div>
        </div>

        {[
          {
            heading: 'What Alberta Golf Courses Need in Booking Software',
            body: `Alberta&apos;s golf market is distinct. Short seasons, price-sensitive golfers, strong community culture, and a market dominated by a handful of large platforms. The right booking software for an Alberta course needs to:\n\n• Handle real-time tee sheet management without double-booking\n• Keep more revenue in the course&apos;s hands (not the platform&apos;s)\n• Be fast enough for Pro Shop staff to use mid-round rush\n• Reach golfers actively searching for tee times — not just the course&apos;s existing repeat customers\n• Offer transparent pricing that golfers trust`,
          },
          {
            heading: 'The GolfNow Problem',
            body: `GolfNow is the dominant third-party booking platform in North America, and many Alberta courses list on it for distribution reach. The trade-off is significant: GolfNow takes 3–6% of each greens fee as a commission.\n\nOn a $75 round, that&apos;s $2.25–$4.50 per booking going to a platform rather than your course. Multiply that by hundreds of rounds a season and it&apos;s a meaningful revenue leak — especially for shorter Alberta seasons where every dollar counts.\n\nGolfNow also controls the customer relationship. Golfers become GolfNow customers first, your course second.`,
          },
          {
            heading: 'What PAR-Tee Offers Alberta Courses',
            body: `PAR-Tee was built specifically to address the GolfNow problem for Alberta courses:\n\n**Flat $2.75 per booking fee** — regardless of greens fee. On a $75 round, you keep $72.25. On a $120 round, you keep $117.25. No percentage, no tiers, no surprises.\n\n**Founding Partner rate of $1.50/booking** — permanently locked in for the first 20 Alberta courses to partner before public launch.\n\n**Real-time tee sheet** — your availability syncs live. No stale listings, no manual updates.\n\n**Course dashboard** — Pro Shop View for booking management, Manager View for revenue analytics and golfer trends.\n\n**Built-in golfer discovery** — golfers browsing PAR-Tee by mood discover your course organically. You gain reach without paying for it.\n\n**No contracts** — cancel anytime. You&apos;re not locked in.`,
          },
          {
            heading: 'Comparison: PAR-Tee vs. GolfNow vs. Building Your Own',
            body: `**GolfNow:** Broad distribution, well-known brand, but 3–6% commission per booking. You lose revenue and the customer relationship.\n\n**Building your own booking system:** Full control, no commissions, but expensive to build, maintain, and market. Most courses lack the technical resources to do this well.\n\n**PAR-Tee:** Flat fee, no contracts, built-in golfer community. Reaches new golfers without the commission structure. Best of both worlds for most Alberta courses.`,
          },
          {
            heading: 'How to Partner with PAR-Tee',
            body: `Becoming a PAR-Tee Course Partner is straightforward:\n\n1. Contact us at courses@par-tee.ca to start the onboarding process\n2. Our team sets up your course profile within 24 hours\n3. You configure tee times, pricing, and availability via the dashboard\n4. Go live — golfers can book immediately\n5. Receive automatic payouts via Stripe Connect within 2 business days of each booking\n\nFounding Partner spots (at the $1.50/booking rate) are limited to the first 20 Alberta courses. Contact us before launch to lock in that rate permanently.`,
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.gray900, marginBottom: '0.75rem' }}>{section.heading}</h2>
            <div style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{section.body}</div>
          </div>
        ))}

        <div style={{ background: `linear-gradient(135deg, ${COLORS.greenDark}, ${COLORS.green})`, borderRadius: 20, padding: '2.5rem', textAlign: 'center', color: COLORS.white }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏌️</div>
          <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.75rem' }}>Ready to Partner?</h3>
          <p style={{ opacity: 0.88, marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.65 }}>
            Alberta courses — contact us to claim your Founding Partner rate before launch. Limited to the first 20 courses.
          </p>
          <Link href="mailto:courses@par-tee.ca" style={{ display: 'inline-block', background: COLORS.white, color: COLORS.green, padding: '0.85rem 2.2rem', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
            Contact Us: courses@par-tee.ca
          </Link>
        </div>
      </article>

      <footer style={{ background: COLORS.gray900, color: COLORS.gray600, padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.82rem' }}>&copy; {new Date().getFullYear()} PAR-Tee. All rights reserved.</p>
      </footer>
    </div>
  );
}
