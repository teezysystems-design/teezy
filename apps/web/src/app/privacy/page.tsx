import Link from 'next/link';

const COLORS = {
  green: '#1a7f4b',
  greenDark: '#155f38',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray600: '#4b5563',
  gray700: '#374151',
  gray900: '#111827',
};

export default function PrivacyPage() {
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
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: COLORS.gray900, marginBottom: '0.5rem' }}>
          Privacy Policy
        </h1>
        <p style={{ color: COLORS.gray600, fontSize: '0.9rem', marginBottom: '3rem' }}>
          Last updated: April 8, 2026
        </p>

        {[
          {
            title: '1. Who We Are',
            content: `PAR-Tee is operated by XERN.CO, a company incorporated in Alberta, Canada. When we say "PAR-Tee," "we," "us," or "our" in this policy, we mean XERN.CO and the PAR-Tee platform.\n\nIf you have any questions about this policy or how we handle your data, contact us at: privacy@par-tee.ca`,
          },
          {
            title: '2. Information We Collect',
            content: `**Account information:** Name, email address, and password when you create an account.\n\n**Profile information:** Golf handicap, home city, playing preferences, and mood preferences you provide.\n\n**Booking information:** Tee times booked, courses visited, group members, and booking history.\n\n**Payment information:** Payment is processed by Stripe. We do not store full card numbers. We retain transaction records (amount, date, course) for billing and support.\n\n**Usage data:** How you interact with the app — searches performed, pages viewed, features used — collected via standard analytics tools.\n\n**Location data:** If you grant permission, approximate location to show nearby courses. We do not track location in the background.`,
          },
          {
            title: '3. How We Use Your Information',
            content: `We use your information to:\n\n• Operate the PAR-Tee platform and process your bookings\n• Match you with courses based on your mood and preferences\n• Power leaderboards, handicap tracking, and social features\n• Send booking confirmations and important account notifications\n• Improve the platform based on usage patterns\n• Comply with legal obligations\n\nWe do not sell your personal information to third parties. We do not use your information for advertising outside the PAR-Tee platform.`,
          },
          {
            title: '4. Who We Share Your Information With',
            content: `**Golf courses:** When you make a booking, the course receives your name, tee time, group size, and booking confirmation. This is necessary to fulfill your booking.\n\n**Stripe:** Payment processing. Stripe's Privacy Policy governs how they handle payment data.\n\n**Service providers:** We use third-party services for hosting, analytics, and email (e.g., Vercel, Resend). These providers process data on our behalf under data processing agreements.\n\n**Legal requirements:** We may disclose information if required by law or to protect the rights and safety of PAR-Tee, our users, or the public.`,
          },
          {
            title: '5. Data Retention',
            content: `We retain your account and booking data for as long as your account is active. If you delete your account, we remove your personal profile data within 30 days. Booking records may be retained for up to 7 years for accounting and legal compliance purposes, as required under Alberta law.`,
          },
          {
            title: '6. Your Rights (PIPEDA / Alberta PIPA)',
            content: `Under Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) and Alberta's Personal Information Protection Act (PIPA), you have the right to:\n\n• Access the personal information we hold about you\n• Correct inaccurate information\n• Withdraw consent to certain uses of your data\n• Request deletion of your account and associated personal data\n\nTo exercise any of these rights, contact privacy@par-tee.ca. We will respond within 30 days.`,
          },
          {
            title: '7. Cookies and Tracking',
            content: `The PAR-Tee website uses cookies for essential functionality (session management) and analytics (understanding traffic patterns). We do not use advertising cookies or cross-site tracking.\n\nYou can control cookie settings through your browser. Disabling cookies may affect platform functionality.`,
          },
          {
            title: '8. Children',
            content: `PAR-Tee is not directed to individuals under 18. We do not knowingly collect personal information from anyone under 18. If you believe a minor has created an account, contact us at privacy@par-tee.ca and we will remove it.`,
          },
          {
            title: '9. Security',
            content: `We use industry-standard security measures including HTTPS, encrypted data storage, and access controls. No system is perfectly secure — we commit to notifying affected users promptly if a data breach occurs that affects their personal information, as required by applicable law.`,
          },
          {
            title: '10. Changes to This Policy',
            content: `We may update this policy as the platform evolves. Material changes will be communicated via email or an in-app notice at least 14 days before taking effect. Continued use of PAR-Tee after that date constitutes acceptance of the revised policy.`,
          },
          {
            title: '11. Contact Us',
            content: `Questions, concerns, or requests related to this Privacy Policy:\n\nEmail: privacy@par-tee.ca\nMailing address: XERN.CO, Bonnyville, Alberta, Canada`,
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: COLORS.gray900, marginBottom: '0.75rem' }}>
              {section.title}
            </h2>
            {section.content.split('\n\n').map((para, i) => (
              <p key={i} style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                {para.startsWith('•') || para.includes('\n•')
                  ? para
                  : para.replace(/\*\*(.*?)\*\*/g, (_, m) => m)}
              </p>
            ))}
          </div>
        ))}

        <div style={{ borderTop: `1px solid ${COLORS.gray200}`, paddingTop: '2rem', marginTop: '1rem' }}>
          <Link href="/" style={{ color: COLORS.green, fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Back to PAR-Tee
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: COLORS.gray900, color: COLORS.gray600, padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: COLORS.gray400, fontSize: '0.88rem', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: COLORS.gray400, fontSize: '0.88rem', textDecoration: 'none' }}>Terms</Link>
          </div>
          <p style={{ fontSize: '0.82rem' }}>&copy; {new Date().getFullYear()} PAR-Tee / XERN.CO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
