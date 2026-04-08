---
name: ux-audit-improvement
description: >
  UX audit and improvement for PAR-Tee's React Native mobile app and Next.js
  course dashboard. Use when reviewing screen flows, identifying friction points
  in the booking or onboarding flow, auditing accessibility, or proposing
  UI improvements based on user feedback or analytics.
---

# UX Audit and Improvement — PAR-Tee

Systematic UX review process for PAR-Tee mobile (Expo) and web (Next.js) surfaces.

## Design System

- **Primary color**: `#1a7f4b` (golf green)
- **Type**: System font stack (San Francisco on iOS, Roboto on Android)
- **Spacing**: 4px grid (4, 8, 12, 16, 20, 24, 32)
- **Border radius**: 8 (inputs), 12 (cards), 16 (sheets), 20 (hero cards), 50% (pills)
- **Shared components**: `packages/ui/` — design tokens and base components

## Critical User Flows

### 1. Discovery → Booking (3-tap goal)
```
Home (mood filter) → Course Card → Tee Time Picker → Confirm
```
Audit for: load time, empty state copy, tee time availability clarity

### 2. Onboarding → First Booking
```
Sign up → Mood selection → Discover → Book
```
Audit for: drop-off after mood selection, confusion on "mood match score"

### 3. League Creation → First Match
```
Compete tab → Leagues → Create → Invite → Season start
```
Audit for: commissioner form complexity, invite UX, standing table clarity

### 4. Score Entry → Rank Update
```
Scorecard → Submit → Rank delta animation
```
Audit for: hole entry speed, rank badge animation delight, push notification receipt

## UX Audit Rubric

For each screen, score 1–5:

| Dimension | What to Check |
|-----------|--------------|
| **Clarity** | Is the primary action obvious? Is the hierarchy clear? |
| **Speed** | Does the screen load in < 1s? Are skeleton loaders shown? |
| **Error states** | Are errors actionable? Do empty states explain why and what to do? |
| **Accessibility** | Touch targets ≥ 44px? Color contrast ≥ 4.5:1? Dynamic type support? |
| **Delight** | Is there a moment of joy? (rank badge animation, confetti on booking) |

## Accessibility Checklist

- [ ] All `TouchableOpacity` elements have `accessibilityLabel`
- [ ] Images have `accessibilityRole="image"` and `accessibilityLabel`
- [ ] Color not the only indicator of state (use icon + color for rank tiers)
- [ ] Text scales with `allowFontScaling` (default true, never set false)
- [ ] Minimum touch target: 44×44pt

## Common PAR-Tee UX Issues to Watch

1. **Mood match score**: Users don't understand what % means — add tooltip
2. **Party invite**: After booking confirmation, invite flow feels buried — make it prominent
3. **League bracket**: On small screens, bracket overflows — needs horizontal scroll
4. **Rank badge on profile**: Static without animation — add shimmer/pulse on load
5. **Score entry**: Hole-by-hole entry is slow — consider swipe or +/- stepper

## UX Improvement Proposal Format

```markdown
## UX Improvement: [Screen/Flow]

**Problem:** [What friction exists and where]
**Evidence:** [App Store reviews / session recordings / analytics / heuristic]
**Proposed fix:** [Specific change — link to mockup if available]
**Expected impact:** [Metric that should improve]
**Effort:** S / M / L
**Priority:** High / Medium / Low
```
