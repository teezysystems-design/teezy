---
name: research-intelligence
description: >
  Deep research skill for PAR-Tee. Use when you need competitive analysis,
  market sizing, golf industry trends, player behavior research, or technical
  deep-dives on Expo/React Native/Supabase/Hono capabilities.
---

# Research Intelligence — PAR-Tee

Provides structured research and analysis for PAR-Tee product and technical decisions.

## Use Cases

- **Golf market research**: TAM/SAM/SOM, competitor apps (GolfNow, Grint, Arccos, 18Birdies), pricing benchmarks
- **Player behavior**: booking patterns, mood-based play preferences, social feature engagement
- **Tech stack evaluation**: Expo SDK capabilities, Supabase Realtime limits, Hono edge performance, Mapbox pricing
- **Feature validation**: research whether a proposed feature exists in competitors and how it's implemented
- **API documentation lookup**: Stripe Connect, Expo Push, Supabase, Claude API, PostGIS

## Research Process

1. Define the question clearly — what decision does this research inform?
2. Search for primary sources (official docs, app store reviews, industry reports)
3. Cross-reference at least 2 sources before stating a fact
4. Summarize findings in a structured format: **Finding → Evidence → Implication for PAR-Tee**
5. Flag uncertainty with confidence levels: High / Medium / Low

## Output Format

```markdown
## Research: [topic]

**Question:** [the specific question being answered]
**Date:** [YYYY-MM-DD]
**Confidence:** High / Medium / Low

### Key Findings
- Finding 1 — Source: [URL or doc]
- Finding 2 — Source: [URL or doc]

### Implications for PAR-Tee
- [actionable takeaway]

### Open Questions
- [what still needs investigation]
```

## PAR-Tee Stack Reference

- Mobile: React Native / Expo SDK 51, TypeScript
- API: Hono on Vercel Edge Functions
- DB: Supabase (PostgreSQL + PostGIS + Realtime)
- Auth: Supabase Auth
- Payments: Stripe Connect
- Maps: react-native-maps / Mapbox
- AI: Claude API (claude-haiku-4-5-20251001 for mood matching)
- Monorepo: Turborepo
