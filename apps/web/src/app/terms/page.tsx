import Link from 'next/link';

const COLORS = {
  green: '#1a7f4b',
  white: '#ffffff',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray600: '#4b5563',
  gray700: '#374151',
  gray900: '#111827',
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ color: COLORS.gray600, fontSize: '0.9rem', marginBottom: '3rem' }}>
          Last updated: April 8, 2026
        </p>

        {[
          {
            title: '1. Acceptance of Terms',
            content: `By accessing or using PAR-Tee (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform.\n\nPAR-Tee is operated by XERN.CO ("we," "us," "our"), a company based in Bonnyville, Alberta, Canada. These Terms are governed by the laws of the Province of Alberta and the federal laws of Canada applicable therein.`,
          },
          {
            title: '2. Eligibility',
            content: `You must be at least 18 years old to create an account and use PAR-Tee. By registering, you represent that you are 18 or older and that all information you provide is accurate and complete.`,
          },
          {
            title: '3. The PAR-Tee Platform',
            content: `PAR-Tee is a golf tee time booking and social platform that connects golfers with golf courses. PAR-Tee acts as a marketplace intermediary — we facilitate bookings between golfers ("Golfer Users") and golf course operators ("Course Partners").\n\nPAR-Tee is not a golf course operator. We are not responsible for the quality of the golf experience at any listed course, course conditions, weather, staffing, or any other factors outside our control.`,
          },
          {
            title: '4. Golfer User Terms',
            content: `**Booking:** When you book a tee time through PAR-Tee, you enter into a booking agreement with the Course Partner. PAR-Tee is not a party to that agreement.\n\n**Booking fee:** You agree to pay the PAR-Tee booking fee ($2.75 per booking at standard rate) in addition to the course greens fee at the time of booking.\n\n**Cancellations:** Cancellation policies are set by each Course Partner and are displayed at the time of booking. PAR-Tee waives the booking fee on cancellations made within the Course Partner's cancellation window. Greens fee refunds are subject to the Course Partner's policy.\n\n**Conduct:** You agree to behave in accordance with golf course rules, etiquette, and applicable laws when using any course booked through PAR-Tee.\n\n**Accuracy:** You are responsible for ensuring booking details (date, time, group size) are accurate at the time of booking.`,
          },
          {
            title: '5. Course Partner Terms',
            content: `**Listing accuracy:** Course Partners are responsible for maintaining accurate tee sheet availability, pricing, and course information on the platform. PAR-Tee is not liable for losses resulting from inaccurate listings.\n\n**Fulfillment:** Course Partners agree to honor all confirmed bookings made through PAR-Tee. Failure to fulfill confirmed bookings may result in account suspension.\n\n**Founding Partner rate:** Founding Partners who lock in the $1.50/booking rate prior to public launch will maintain that rate for as long as they remain active Course Partners in good standing. PAR-Tee reserves the right to terminate the Founding Partner rate with 90 days notice if platform economics require adjustment.\n\n**Payouts:** Payouts are processed via Stripe Connect. Course Partners agree to Stripe's terms and to provide accurate banking information. PAR-Tee is not liable for payout delays caused by Stripe or banking systems.\n\n**Content:** Course Partners grant PAR-Tee a license to display course names, descriptions, photos, and other submitted content on the platform for the purpose of marketing and facilitating bookings.`,
          },
          {
            title: '6. Payments',
            content: `All payments are processed by Stripe, Inc. By making a payment, you agree to Stripe's Terms of Service. PAR-Tee does not store complete credit card information.\n\nAll prices are displayed in Canadian dollars (CAD) unless otherwise indicated.`,
          },
          {
            title: '7. User Content and Social Features',
            content: `PAR-Tee includes social features including score sharing, leaderboards, and a social feed. By posting content to the platform (scores, photos, comments), you grant PAR-Tee a non-exclusive, royalty-free license to display that content within the platform.\n\nYou are responsible for the content you post. You agree not to post content that is: false or misleading, defamatory, harassing, discriminatory, or in violation of any law. PAR-Tee reserves the right to remove content and suspend accounts that violate these standards.`,
          },
          {
            title: '8. Prohibited Use',
            content: `You agree not to:\n\n• Use the platform for any unlawful purpose\n• Attempt to gain unauthorized access to any part of the platform\n• Scrape, crawl, or automatically collect platform data without permission\n• Create fake accounts or impersonate other users\n• Manipulate leaderboards or scoring features\n• Interfere with platform availability or functionality`,
          },
          {
            title: '9. Disclaimer of Warranties',
            content: `The Platform is provided "as is" and "as available" without warranties of any kind, express or implied. PAR-Tee does not warrant that the platform will be uninterrupted, error-free, or free from security vulnerabilities.\n\nPAR-Tee does not warrant the quality, safety, suitability, or legality of any golf course listed on the platform.`,
          },
          {
            title: '10. Limitation of Liability',
            content: `To the maximum extent permitted by applicable law, PAR-Tee, XERN.CO, and their agents shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the platform, including but not limited to: booking disputes between golfers and courses, course cancellations, weather or course condition issues, or unauthorized access to your account.\n\nPAR-Tee's total liability to you for any claim arising from these Terms shall not exceed the greater of: the booking fees you paid to PAR-Tee in the 12 months preceding the claim, or $50 CAD.`,
          },
          {
            title: '11. Termination',
            content: `Either party may terminate this agreement at any time. You may close your account through the app settings. PAR-Tee may suspend or terminate your account for violations of these Terms, with or without notice.\n\nUpon termination, your right to use the Platform ceases. Sections 9, 10, and 12 survive termination.`,
          },
          {
            title: '12. Governing Law and Disputes',
            content: `These Terms are governed by the laws of the Province of Alberta and the federal laws of Canada. Any disputes shall be resolved in the courts of Alberta.\n\nBefore initiating legal proceedings, both parties agree to attempt to resolve disputes informally by contacting support@par-tee.ca.`,
          },
          {
            title: '13. Changes to These Terms',
            content: `We may update these Terms from time to time. Material changes will be communicated via email or in-app notice at least 14 days before taking effect. Continued use of the Platform after that date constitutes acceptance of the revised Terms.`,
          },
          {
            title: '14. Contact',
            content: `Questions about these Terms: legal@par-tee.ca\nGeneral support: support@par-tee.ca\nCourse partnerships: courses@par-tee.ca\n\nXERN.CO, Bonnyville, Alberta, Canada`,
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: COLORS.gray900, marginBottom: '0.75rem' }}>
              {section.title}
            </h2>
            {section.content.split('\n\n').map((para, i) => (
              <p key={i} style={{ color: COLORS.gray700, fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '0.75rem', whiteSpace: 'pre-line' }}>
                {para}
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
