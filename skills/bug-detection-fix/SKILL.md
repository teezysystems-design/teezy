---
name: bug-detection-fix
description: >
  Autonomous bug detection and fix for PAR-Tee's Turborepo monorepo.
  Use when investigating runtime errors, TypeScript issues, Supabase query failures,
  Expo build errors, Hono edge function exceptions, or Stripe webhook failures.
---

# Bug Detection and Autonomous Fix — PAR-Tee

Structured process for finding, diagnosing, and fixing bugs in the PAR-Tee codebase.

## Monorepo Structure

```
apps/mobile/    — Expo React Native app
apps/web/       — Next.js 15 course dashboard
apps/api/       — Hono Vercel Edge Functions (api/index.ts entry)
packages/db/    — Supabase migrations + typed client
packages/shared/ — Shared types, utils, rank constants
packages/ui/    — Shared UI components
```

## Bug Categories & Diagnostic Paths

### 1. Mobile (Expo/React Native)
- **Render errors**: Check component props, null guards, FlatList `keyExtractor`
- **Navigation errors**: Check Expo Router file-based routes and `router.push()` paths
- **Supabase auth**: Check `session?.access_token` guard before API calls
- **Push notifications**: Verify `expo-notifications` permissions flow and Expo token registration

### 2. API (Hono Edge)
- **Zod validation**: Check schema matches request body; look at `c.req.valid('json')`
- **Supabase admin client**: Check `createAdminClient()` is used (not anon) for server-side ops
- **CORS**: Verify `WEB_URL` env var; mobile uses `capacitor://localhost`
- **Rate limiting**: `standardRateLimit` (100/min) vs `strictRateLimit` (10/min) placement

### 3. Database (Supabase/PostgreSQL)
- **Row Level Security**: Check policy allows the operation; use admin client to bypass in API
- **PostGIS queries**: Validate `ST_DWithin` usage with geography type
- **Type mismatch**: Compare `packages/shared/src/types.ts` against actual DB columns

### 4. Build / TypeScript
- Run `npx tsc --noEmit` in the affected app's directory
- Common: missing `?` null guards, implicit `any` from untyped Supabase responses

## Fix Protocol

1. **Reproduce**: identify the exact error message, file, and line
2. **Isolate**: find the root cause (not just the symptom)
3. **Fix**: make the minimal change that resolves the root cause
4. **Verify**: re-run `tsc --noEmit`; if tests exist, run them
5. **Document**: add a comment only if the fix is non-obvious

## Commands

```bash
# TypeScript check (mobile)
npx tsc --noEmit --project apps/mobile/tsconfig.json

# TypeScript check (api)
npx tsc --noEmit --project apps/api/tsconfig.json

# TypeScript check (all)
npx turbo typecheck
```
