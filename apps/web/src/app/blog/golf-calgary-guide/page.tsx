import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Golf in Calgary: Complete Guide for 2026 | PAR-Tee',
  description:
    'Everything you need to know about golf in Calgary. Best courses, booking tips, season guide, and how PAR-Tee makes booking faster and cheaper.',
  keywords: 'golf Calgary, Calgary golf guide, tee times Calgary, Calgary golf courses 2026, book golf Calgary',
  openGraph: {
    title: 'Golf in Calgary: The Complete 2026 Guide',
    description: 'Season guide, course recommendations, booking tips, and more for golfers in Calgary, Alberta.',
    type: 'article',
  },
};

const COLORS = {
  green: '#1a7f4b', greenDark: '#155f38',
  greenPale: '#e8f5ee', greenPale2: '#f0faf4',
  white: '#ffffff', gray50: '#f9fafb', gray200: '#e5e7eb',
  gray400: '#9ca3af', gray600: '#4b5563', gray700: '#374151', gray900: '#111827',
};

export default function GolfCalgaryGuidePage() {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.white }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${COLORS.gray200}`, padding: '0 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.3rem' }}>⛳</span>
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: COLORS.green }}>PAR-Tee</span>
          </Link>
          <Link href="/#waitlist" style={{ background: COLORS.green, color: COLORS.white, padding: '0.5rem 1.4rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Join Waitlist</Link>
        </div>
      </nav>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', fontSize: '0.85rem', color: COLORS.gray600 }}>
          <Link href="/" style={{ color: COLORS.green, textDecoration: 'none' }}>PAR-Tee</Link>
          <span>›</span>
          <Link href="/blog" style={{ color: COLORS.green, textDecoration: 'none' }}>Blog</Link>
          <span>›</span>
          <span>Golf in Calgary Guide</span>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ display: 'inline-block', background: COLORS.greenPale, color: COLORS.green, padding: '0.2rem 0.75rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            CALGARY GOLF
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: COLORS.gray900, lineHeight: 1.2, marginBottom: '1rem' }}>
            Golf in Calgary: The Complete 2026 Guide
          </h1>
          <p style={{ color: COLORS.gray600, fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Calgary sits at the doorstep of the Canadian Rockies with a golf scene that punches well above its weight. Whether you&apos;re a new golfer or a competitive player hunting your best round, this guide covers everything you need to plan your season.
          </p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: COLORS.gray600, flexWrap: 'wrap' }}>
            <span>📅 April 2026</span>
            <span>⏱️ 7 min read</span>
          </div>
        </div>

        {[
          {
            heading: 'When Is Golf Season in Calgary?',
            body: `The Calgary golf season typically runs from late April through mid-October, with peak conditions in June, July, and August.\n\n**Late April – May:** Courses open but conditions can be firm and cool. Early-season deals are common. Snow is still possible in April.\n\n**June – August:** Prime season. Long daylight hours (sunset past 9pm in July), warm temps, and courses in peak condition. Book early for weekends.\n\n**September:** Arguably the best month for golf in Calgary. Crowds thin out, greens fees drop, and the foothills colours are spectacular. Highly underrated.\n\n**October:** Short season but still possible. Courses often close after Thanksgiving weekend (mid-October).`,
          },
          {
            heading: 'Types of Golf Courses in Calgary',
            body: `Calgary offers a range of course types to match every golfer and budget:\n\n**Municipal courses** (McCall Lake, Confederation): City-operated, budget-friendly, beginner-accessible. Greens fees start around $25–$40.\n\n**Public courses** (Springbank Links, Country Hills): Open to all, no membership required. Greens fees $60–$100. Often the sweet spot for recreational golfers.\n\n**Semi-private** (Priddis Greens, Elbow Springs, Bearspaw): Limited public access with priority for members. Premium conditioning and facilities. Greens fees $80–$140+.\n\n**Links-style courses:** Calgary has a few genuine links-style layouts (Springbank is the standout) that reward a ground game and play very differently from the parkland majority.`,
          },
          {
            heading: 'Calgary vs. Edmonton: Golf Differences',
            body: `Both cities offer excellent golf, but the experience differs:\n\n**Terrain:** Calgary courses tend toward foothills and open terrain with Rockies views. Edmonton courses lean more parkland and river valley.\n\n**Wind:** Calgary is windier — a factor at open courses like Springbank that can add 5–10 strokes to your round.\n\n**Season length:** Slightly shorter in Calgary due to altitude and northern latitude, but comparable.\n\n**Course density:** Edmonton has a slight edge in sheer number of accessible public courses. Calgary compensates with more dramatic scenery.`,
          },
          {
            heading: 'Booking Tee Times in Calgary',
            body: `Most Calgary courses offer online booking through their own websites, with varying levels of technology. The experience ranges from seamless (newer courses) to frustrating (older club websites built before smartphones existed).\n\n**Key tips:**\n\n• Weekend morning tee times at premium courses book up 1–2 weeks ahead\n• Twilight rates (usually after 3–4pm) can be 30–50% cheaper and are fully playable in summer\n• Walking is permitted at most Calgary courses — a rare luxury compared to many North American markets\n• Calgary courses close when snow hits the greens, even mid-season — check conditions after cold snaps\n\n**PAR-Tee** is launching in Calgary with a flat $2.75 booking fee and mood-based discovery — so instead of calling around, you tell us how you want to play and we show you available tee times that match.`,
          },
          {
            heading: 'Handicap and Competition Golf in Calgary',
            body: `Calgary has an active competitive golf community through Golf Alberta and various club leagues. If you&apos;re tracking your handicap, get registered with Golf Canada — your handicap is calculated via the World Handicap System and is usable at any certified course.\n\nFor informal competitive golf — match play, scrambles, 1v1 rounds — PAR-Tee&apos;s social layer will connect you with other golfers looking for the same type of game.`,
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.gray900, marginBottom: '0.75rem' }}>{section.heading}</h2>
            <div style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{section.body}</div>
          </div>
        ))}

        <div style={{ background: `linear-gradient(135deg, ${COLORS.greenDark}, ${COLORS.green})`, borderRadius: 20, padding: '2.5rem', textAlign: 'center', color: COLORS.white }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⛳</div>
          <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.75rem' }}>Book Calgary Golf with PAR-Tee</h3>
          <p style={{ opacity: 0.88, marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.65 }}>
            Launching in Calgary. Book by mood, pay flat, compete locally.
          </p>
          <Link href="/#waitlist" style={{ display: 'inline-block', background: COLORS.white, color: COLORS.green, padding: '0.85rem 2.2rem', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
            Join the Calgary Waitlist →
          </Link>
        </div>
      </article>

      <footer style={{ background: COLORS.gray900, color: COLORS.gray600, padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.82rem' }}>&copy; {new Date().getFullYear()} PAR-Tee. All rights reserved.</p>
      </footer>
    </div>
  );
}
