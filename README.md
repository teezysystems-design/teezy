# PAR-Tee

Golf booking and social platform by XERN.CO.

## Monorepo Structure

```
par-tee/
├── apps/
│   ├── web/        # Course Dashboard — Next.js 15 App Router
│   ├── mobile/     # Golfer App — React Native + Expo SDK
│   └── api/        # Hono API — Vercel Edge Functions
├── packages/
│   ├── db/         # Database — Drizzle ORM + Supabase types
│   ├── ui/         # Shared UI component library + design tokens
│   ├── shared/     # Shared TypeScript types, utils, constants
│   ├── tsconfig/   # Shared TypeScript configurations
│   └── eslint-config/ # Shared ESLint configurations
├── docs/           # Product and developer documentation
└── .github/
    └── workflows/  # CI/CD pipelines
```

## Prerequisites

- Node.js >= 20
- npm >= 10
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Vercel CLI](https://vercel.com/docs/cli) (for API deployment)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for mobile)

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd par-tee
npm install
```

### 2. Configure environment variables

Copy the example env files and fill in your values:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

You will need:
- A [Supabase](https://supabase.com) project (URL + anon key + service role key)
- A [Stripe](https://stripe.com) account with Connect enabled (API key + webhook secret)

### 3. Start development

Run all apps in parallel:

```bash
npm run dev
```

Or run individual apps:

```bash
# Web dashboard (http://localhost:3000)
cd apps/web && npm run dev

# API edge server (http://localhost:4000)
cd apps/api && npm run dev

# Mobile (Expo Go or simulator)
cd apps/mobile && npx expo start
```

## Turborepo Tasks

| Command | Description |
|---|---|
| `npm run build` | Build all apps and packages |
| `npm run dev` | Start all apps in dev mode |
| `npm run lint` | Lint all workspaces |
| `npm run type-check` | TypeScript check all workspaces |
| `npm run test` | Run all tests |
| `npm run format` | Format with Prettier |
| `npm run clean` | Remove all build artifacts |

## Architecture

- **Web**: Next.js 15 App Router — deployed to Vercel
- **API**: Hono on Vercel Edge Functions — zero cold-start latency
- **Mobile**: React Native + Expo SDK — iOS and Android via EAS Build
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth (email + OAuth)
- **Payments**: Stripe Connect for course billing + golfer transactions

## CI/CD

GitHub Actions runs on every PR and push to `main`/`develop`:
- Lint check
- TypeScript type check
- Format check (Prettier)
- Build (all workspaces)
- Tests

## Contributing

This repo is operated by AI agents coordinated through Paperclip. See individual task issues for context on what each agent is building.
