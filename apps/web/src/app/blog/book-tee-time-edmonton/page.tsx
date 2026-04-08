import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Book a Tee Time in Edmonton (Fast) | PAR-Tee',
  description:
    'The fastest way to book a tee time in Edmonton, Alberta. Skip the phone calls — find available tee times at Edmonton golf courses and book online in under 60 seconds.',
  keywords: 'book tee time Edmonton, Edmonton tee times, book golf Edmonton, Edmonton golf booking, online tee time Edmonton',
  openGraph: {
    title: 'How to Book a Tee Time in Edmonton',
    description: 'Stop calling golf courses. Here is how to book tee times online in Edmonton faster than ever.',
    type: 'article',
  },
};

const COLORS = {
  green: '#1a7f4b', greenDark: '#155f38', greenLight: '#2db870',
  greenPale: '#e8f5ee', greenPale2: '#f0faf4',
  white: '#ffffff', gray50: '#f9fafb', gray200: '#e5e7eb',
  gray400: '#9ca3af', gray600: '#4b5563', gray700: '#374151', gray900: '#111827',
};

export default function BookTeeTimeEdmontonPage() {
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
          <span>Book a Tee Time in Edmonton</span>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ display: 'inline-block', background: COLORS.greenPale, color: COLORS.green, padding: '0.2rem 0.75rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            EDMONTON GOLF
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: COLORS.gray900, lineHeight: 1.2, marginBottom: '1rem' }}>
            How to Book a Tee Time in Edmonton (Without the Phone Call)
          </h1>
          <p style={{ color: COLORS.gray600, fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Most Edmonton golfers still book tee times by phone or through outdated course websites. Here&apos;s what you should know about booking golf in Edmonton — and how PAR-Tee is making the whole process better.
          </p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: COLORS.gray600, flexWrap: 'wrap' }}>
            <span>📅 April 2026</span>
            <span>⏱️ 5 min read</span>
          </div>
        </div>

        {[
          {
            heading: 'The Current State of Tee Time Booking in Edmonton',
            body: `If you&apos;ve tried to book a tee time at an Edmonton golf course recently, you know the drill: find the course website (often old and slow), navigate to the booking page, pick a date, find out your preferred time is gone, call the pro shop to double-check, and eventually commit to something that works.\n\nFor popular courses like The Ranch or Jagare Ridge on a summer Saturday, this process starts days before your actual round. The booking experience hasn&apos;t kept up with the quality of the courses.`,
          },
          {
            heading: 'What Edmonton Golfers Actually Want',
            body: `Golfers consistently say the same things:\n\n• Real-time availability — not last night&apos;s cached tee sheet\n• The ability to book without calling\n• Transparent pricing — no mystery &quot;online booking fees&quot; or percentage markups\n• Group booking that doesn&apos;t require one person to juggle the whole party\n• Confirmation that actually stays confirmed\n\nThese aren&apos;t complicated asks. They&apos;re table stakes for a modern booking experience.`,
          },
          {
            heading: 'How PAR-Tee Changes Tee Time Booking in Edmonton',
            body: `PAR-Tee is building the tee time booking experience Edmonton golfers deserve. Here&apos;s how it works:\n\n**Mood-first discovery:** Before searching, you pick your playing mood — Competitive, Relaxed, Social, Scenic, or Beginner-Friendly. PAR-Tee filters available tee times to match. No more booking the wrong course for the wrong day.\n\n**Real-time availability:** The tee sheet syncs live. If a time is showing, it&apos;s available. No phantom bookings, no calling to confirm.\n\n**Flat $2.75 fee:** That&apos;s it. No percentage of your greens fee, no dynamic pricing, no surprises at checkout.\n\n**Group booking:** Invite up to 3 friends from the app. Each person pays their own share. Everyone gets confirmed instantly.`,
          },
          {
            heading: 'The Best Time to Book Golf in Edmonton',
            body: `Edmonton&apos;s golf season runs roughly May through September, with peak golf weather in June and July. Here&apos;s the booking timing guide:\n\n**Premium weekend morning tee times** at top courses: Book 7–14 days ahead. These fill fast.\n\n**Weekday rounds:** 2–4 days ahead is usually sufficient, even at popular courses.\n\n**Twilight/late afternoon:** Often available same-day at most courses. Great value and long summer days mean you have plenty of light.\n\n**Early May and late September:** Courses are less busy, greens fees often drop, and the fairways are in great shape. Underrated golf windows.`,
          },
          {
            heading: 'Edmonton Tee Time Pricing: What to Expect',
            body: `Edmonton golf spans a wide price range:\n\n**Municipal courses** (Victoria, Riverside): $25–$45 greens fee\n\n**Public courses** (Lewis Estates, Raven Crest): $55–$85\n\n**Premium public** (The Ranch, Jagare Ridge): $75–$110\n\n**Semi-private** (River Ridge, Windermere): $80–$140+\n\nPAR-Tee adds a flat $2.75 booking fee on top of whatever the course charges. No percentage-based markups.`,
          },
          {
            heading: 'Be Ready When PAR-Tee Launches in Edmonton',
            body: `PAR-Tee is launching in Edmonton with the mission of making tee time booking fast, fair, and built for competitive golfers. Early users get priority access and the best tee time windows before anyone else.`,
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.gray900, marginBottom: '0.75rem' }}>{section.heading}</h2>
            <div style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{section.body}</div>
          </div>
        ))}

        <div
          style={{ background: `linear-gradient(135deg, ${COLORS.greenDark}, ${COLORS.green})`, borderRadius: 20, padding: '2.5rem', textAlign: 'center', color: COLORS.white }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⛳</div>
          <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.75rem' }}>Get Early Access in Edmonton</h3>
          <p style={{ opacity: 0.88, marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.65 }}>
            PAR-Tee is launching in Edmonton. Join the waitlist to be among the first golfers to book tee times by mood.
          </p>
          <Link href="/#waitlist" style={{ display: 'inline-block', background: COLORS.white, color: COLORS.green, padding: '0.85rem 2.2rem', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
            Join the Edmonton Waitlist →
          </Link>
        </div>
      </article>

      <footer style={{ background: COLORS.gray900, color: COLORS.gray600, padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.82rem' }}>&copy; {new Date().getFullYear()} PAR-Tee. All rights reserved.</p>
      </footer>
    </div>
  );
}
