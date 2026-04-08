---
name: code-review-quality
description: >
  Code review and quality standards for PAR-Tee's TypeScript monorepo.
  Use when reviewing PRs, auditing code quality, enforcing coding standards,
  or checking for security issues in Hono API routes, React Native screens,
  or Supabase queries.
---

# Code Review and Quality Standards — PAR-Tee

Standards and review checklist for PAR-Tee's TypeScript/React Native/Hono codebase.

## Review Checklist

### Security (Block on any of these)
- [ ] No raw SQL string interpolation (use parameterized queries / Supabase client)
- [ ] No `Authorization` header logged or exposed
- [ ] Supabase admin client (`SERVICE_ROLE_KEY`) never imported in mobile app
- [ ] All API routes that mutate data have `authMiddleware`
- [ ] No `process.env` secrets accessed in client-side (mobile/web) code
- [ ] Zod schema validates all untrusted inputs before use
- [ ] No `dangerouslySetInnerHTML` in web/Next.js code

### Correctness
- [ ] No `as any` casts that hide real type errors
- [ ] Async functions have proper `try/catch` or error propagation
- [ ] Supabase queries check for `.error` before using `.data`
- [ ] RLS policies cover all intended operations (SELECT, INSERT, UPDATE, DELETE)
- [ ] Push notifications respect max-2/day enforcement (server-side check)

### Performance
- [ ] Supabase selects specify columns (`select('id, name')` not `select('*')`)
- [ ] FlatList/ScrollView uses `keyExtractor` with stable IDs
- [ ] No uncancelled subscriptions (Supabase Realtime channels cleaned up on unmount)
- [ ] API responses paginated for lists > 100 items
- [ ] PostGIS queries use spatial indexes

### Code Style
- [ ] No console.log in production paths (use structured logging or remove)
- [ ] Component files ≤ 300 lines (extract sub-components if larger)
- [ ] No inline style objects in JSX hot paths (move to StyleSheet.create)
- [ ] Shared types live in `packages/shared/src/types.ts`, not duplicated
- [ ] Route handlers are thin — business logic belongs in service functions

### React Native Specifics
- [ ] `TouchableOpacity` has `activeOpacity` set
- [ ] Text inside `<Text>` only (no mixed JSX children with bare strings)
- [ ] Images have explicit width/height or `flex: 1`
- [ ] Modal/sheet cleanup on unmount

## Review Comment Format

```
[BLOCK] Security: user input interpolated into SQL query on line 42.
  → Use Supabase parameterized query instead.

[WARN] Performance: `select('*')` on large courses table. Specify columns.

[NIT] Style: magic number `1240` — extract as named constant.
```

Levels: **BLOCK** (must fix before merge) → **WARN** (should fix) → **NIT** (optional polish)

## PAR-Tee ESLint Config

Shared config in `packages/eslint-config/`. Key rules:
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: error
- `react-hooks/exhaustive-deps`: warn (treat as error for network calls)

## Running Quality Checks

```bash
npx turbo lint          # ESLint across all packages
npx turbo typecheck     # TypeScript across all packages
```
