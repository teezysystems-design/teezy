---
name: legal-document-generation
description: >
  Legal document drafting for PAR-Tee. Use when generating Terms of Service,
  Privacy Policy, course partner agreements, league commissioner terms,
  or GDPR/CCPA compliance notices. Always flag for human legal review before publishing.
---

# Legal Document Generation — PAR-Tee

Templates and guidance for PAR-Tee's legal documents. **All outputs require human legal review before publication.**

## Key Legal Areas

### 1. Terms of Service
PAR-Tee-specific provisions needed:
- **Booking liability**: PAR-Tee facilitates bookings; course is responsible for tee time fulfillment
- **Ranking system**: Points/tiers are entertainment features, not financial instruments
- **League rules**: Commissioner sets rules; PAR-Tee is not arbitrator of disputes
- **AI mood matching**: Recommendations are suggestions only; no guarantee of course availability
- **User-generated content**: Feed posts, scores — user grants PAR-Tee license to display

### 2. Privacy Policy
Data collected by PAR-Tee:
- Location data (for nearby course discovery) — opt-in, used only during active session
- Contacts sync (for friends feature) — opt-in, phone numbers hashed before transmission
- Round scores and handicap — stored for ranking, visible to friends per privacy settings
- Push notification tokens — Expo token, used only for authorized notification types
- Payment info — handled by Stripe; PAR-Tee does not store card data

### 3. Course Partner Agreement
Key terms for course dashboard users:
- Course owns their tee time inventory and pricing
- PAR-Tee charges [X]% booking commission on completed reservations
- Course can create tournaments; PAR-Tee provides leaderboard infrastructure
- Course must honor bookings made through PAR-Tee
- 30-day termination notice required

### 4. League Commissioner Terms
- Commissioner is responsible for rule enforcement within their league
- PAR-Tee provides the platform; commissioner resolves disputes
- PAR-Tee may terminate leagues that violate community guidelines

## Document Structure Template

```markdown
# [Document Title]
**Effective Date:** [DATE]
**Last Updated:** [DATE]

## 1. Introduction
[Who we are, what this document covers]

## 2. [Key Section]
[...]

## Contact
legal@par-tee.com
```

## GDPR/CCPA Checklist

- [ ] Data collection disclosed at point of collection (location, contacts)
- [ ] Opt-in consent for optional data (contacts sync, marketing emails)
- [ ] Right to deletion: `DELETE /v1/users/me` endpoint exists
- [ ] Data export: user can request their data
- [ ] Retention policy: round data kept for [X] years; deleted on account deletion

## ⚠️ Important

These are starting points only. PAR-Tee must have a licensed attorney review all public-facing legal documents before they go live. Flag any output from this skill with: **"DRAFT — Requires attorney review before publication."**
