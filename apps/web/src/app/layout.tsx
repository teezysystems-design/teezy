import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://par-tee.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { template: '%s | PAR-Tee', default: 'PAR-Tee — Book Golf by Mood' },
  description: 'Discover and book golf tee times based on how you feel. Find courses that match your vibe.',
  openGraph: {
    type: 'website',
    siteName: 'PAR-Tee',
    title: 'PAR-Tee — Book Golf by Mood',
    description: 'Discover and book golf tee times based on how you feel.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'PAR-Tee Golf Booking' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PAR-Tee — Book Golf by Mood',
    description: 'Discover and book golf tee times based on how you feel.',
  },
  alternates: {
    canonical: BASE_URL,
  },
};

// Site-wide JSON-LD structured data (Organization + WebSite)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'PAR-Tee',
      url: BASE_URL,
      description: 'Golf tee time booking platform that matches golfers to courses by mood.',
    },
    {
      '@type': 'WebSite',
      url: BASE_URL,
      name: 'PAR-Tee',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/courses?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>{children}</body>
    </html>
  );
}
