# Form Builder

A Typeform-style form builder. Create forms with branching question types, share a public link, and view responses in a dashboard.

Built with Next.js 16 (App Router), React 19, Prisma 7 on Postgres, Supabase Auth, and Tailwind 4.

## Features

- Email + password auth (Supabase)
- Drag-free question editor with welcome and thank-you screens
- Question types: short text, long text, single choice, dropdown, statement
- Optional weighted scoring on choice questions
- Public share link with one-response-per-respondent enforcement
- Responses dashboard with per-form table view
- Row-level security at the database layer (`app/rls.sql`)

## Stack

| Layer    | Choice                                    |
| -------- | ----------------------------------------- |
| Framework | Next.js 16 (App Router, Server Actions)  |
| UI       | React 19, Tailwind CSS 4, Framer Motion  |
| Database | Postgres via Prisma 7 (`@prisma/adapter-pg`) |
| Auth     | Supabase (`@supabase/ssr`)               |
| Tests    | Vitest (unit), Playwright (e2e)          |

## Getting Started

### 1. Install

```bash
npm install
```

`postinstall` runs `prisma generate` automatically.

### 2. Configure environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
DATABASE_URL=postgresql://...:5432/postgres   # pooled, used at runtime
DIRECT_URL=postgresql://...:5432/postgres     # direct, used by migrations
```

### 3. Database

Apply schema and row-level security policies:

```bash
npx prisma migrate deploy
psql "$DIRECT_URL" -f app/rls.sql
```

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command             | What it does                  |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start dev server              |
| `npm run build`     | Production build              |
| `npm start`         | Run production build          |
| `npm test`          | Vitest unit tests             |
| `npm run test:watch`| Vitest watch mode             |
| `npm run test:e2e`  | Playwright end-to-end tests   |

## Project Layout

```
app/
  (auth)/         sign-in / sign-up routes
  actions/        server actions (form CRUD, responses)
  api/            route handlers
  dashboard/      authenticated form list + responses
  forms/[id]/     public form filler
  rls.sql         Postgres row-level security policies
components/       shared React components
hooks/            client hooks
lib/              prisma client, supabase clients, helpers
prisma/schema.prisma
e2e/              Playwright specs
proxy.ts          Next.js proxy (auth gate, rewrites)
```

## Testing

- Unit tests live next to the code as `*.test.ts(x)` and run via Vitest with jsdom.
- End-to-end specs in `e2e/` exercise the public form flow and dashboard.
- See [`TEST-PLAN.md`](./TEST-PLAN.md) for the full coverage matrix.

## Design

UI tokens, motion, and layout principles live in [`DESIGN.md`](./DESIGN.md).

## Deploy

Deploys cleanly to Vercel. Set the environment variables above in the project, point `DATABASE_URL` at a pooled Postgres connection, and trigger a deployment.
