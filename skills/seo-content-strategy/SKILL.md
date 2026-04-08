---
name: seo-content-strategy
description: >
  SEO and content strategy for PAR-Tee. Use when optimizing the course dashboard
  web app (Next.js 15) for search, writing blog content, creating course landing
  pages, planning social media content, or improving App Store Optimization (ASO).
---

# SEO and Content Strategy — PAR-Tee

Search and content strategy for PAR-Tee's web presence and mobile App Store ranking.

## Web SEO (Course Dashboard — Next.js 15)

### Target Keywords
- Course-specific: "[Course Name] tee times", "[City] golf courses", "[Course Name] booking"
- Generic: "golf tee time booking app", "book golf near me", "golf leagues app"
- Long-tail: "casual golf booking app", "golf friends app", "golf ranking app"

### Next.js 15 SEO Implementation

```typescript
// app/courses/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await getCourse(params.slug);
  return {
    title: `${course.name} — Book Tee Times | PAR-Tee`,
    description: `Book tee times at ${course.name} in ${course.city}. ${course.holeCount} holes, par ${course.par}. Reserve your spot in seconds.`,
    openGraph: {
      title: `${course.name} | PAR-Tee`,
      description: course.description,
      images: [course.heroImageUrl],
    },
  };
}
```

### Course Landing Pages (Key SEO Asset)
Each course should have a public landing page at `/courses/[slug]`:
- Course name, city, description
- Next available tee times (structured data: `GolfCourse` schema.org)
- Reviews/rating aggregate
- CTA: "Download PAR-Tee to book"

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "GolfCourse",
  "name": "{{course.name}}",
  "address": { "@type": "PostalAddress", "addressLocality": "{{course.city}}" },
  "geo": { "@type": "GeoCoordinates", "latitude": "{{lat}}", "longitude": "{{lng}}" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "{{rating}}", "reviewCount": "{{count}}" }
}
```

## App Store Optimization (ASO)

### iOS App Store
- **Title** (30 chars): PAR-Tee: Golf Tee Time Booking
- **Subtitle** (30 chars): Rank Up. League Up. Play More.
- **Keywords** (100 chars): golf,tee time,golf league,golf tracker,golf booking,handicap,golf score,golf social
- **Screenshots**: Mood discovery → booking flow → rank card → league bracket

### Google Play Store
- **Short description** (80 chars): Book tee times, compete in leagues, and rank up with every round.
- **Long description**: Lead with discovery/AI matching, then booking, then social/ranking

## Content Calendar (Monthly)

| Week | Content | Channel |
|------|---------|---------|
| 1 | "How PAR-Tee's mood matching works" | Blog + App Store feature |
| 2 | Course spotlight (partner course deep dive) | SEO landing page |
| 3 | "League season recap" (user story) | Social media |
| 4 | "Golf near [City]" city guide | Blog (targets local SEO) |

## City Guide SEO Strategy

Create `/guides/golf-in-[city]` pages for top 20 US golf markets:
- Phoenix, Scottsdale, Palm Springs, Las Vegas, Austin, Dallas, Charlotte, Myrtle Beach, Hilton Head, Florida (multiple)

Each page: list of PAR-Tee courses in that area, local golf culture notes, CTA to download.
