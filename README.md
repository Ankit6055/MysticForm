# MysticForm

MysticForm is a Typeform-style form builder SaaS built for a solo hackathon submission. It includes creator authentication, dynamic form fields, public and unlisted publishing, template cloning, response management, CSV export, analytics, public discovery, password protection, response limits, expiry, rate limiting, honeypot spam protection, and Scalar API docs.

## Demo

- Web app: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`
- Demo email: `demo@mysticform.app`
- Demo password: `mysticform-demo-2026`

Run `pnpm db:seed` to create the demo user, 8 themes, 6 sample forms, 4 templates, and analytics-ready responses.

## Stack

- Turborepo + pnpm workspaces
- Next.js 16 App Router in `apps/web`
- Express + tRPC in `apps/api`
- Drizzle ORM + Postgres
- Zod schemas shared across client and server
- shadcn/ui + Tailwind CSS v4
- Scalar API reference at `/docs`

## Local Setup

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Copy environment variables:

   ```sh
   cp .env.example .env
   cp .env.example .env.local
   ```

3. Start Postgres:

   ```sh
   docker compose up -d
   ```

4. Run migrations:

   ```sh
   pnpm db:migrate
   ```

5. Seed demo content:

   ```sh
   pnpm db:seed
   ```

6. Start the web and API apps:

   ```sh
   pnpm dev
   ```

## Scripts

- `pnpm dev` - run web and API in development
- `pnpm check-types` - generate Next route types and run TypeScript checks
- `pnpm lint` - run workspace lint tasks
- `pnpm db:migrate` - apply Drizzle migrations
- `pnpm db:generate` - generate Drizzle migrations
- `pnpm db:seed` - seed demo themes, forms, responses, and credentials

## Product Walkthrough

1. Sign in with the demo credentials or create a new account.
2. Use **Templates** to clone a starter form, or create a blank form from **Forms**.
3. Add fields in the builder, preview the form, then publish as public or unlisted.
4. Share `/f/[slug]` with respondents.
5. Review submissions in **Responses**, export CSV, and inspect charts in **Analytics**.
6. Use **Explore** to browse public seeded forms. Unlisted forms stay accessible only by direct link.

## Environment Variables

See `.env.example` for the full local set. Important values:

- `DATABASE_URL` - Postgres connection string
- `PORT` - API port, usually `8000`
- `WEB_URL` - web origin, usually `http://localhost:3000`
- `API_URL` - tRPC server URL for server-side web calls
- `NEXT_PUBLIC_API_URL` - tRPC URL for browser calls
- `JWT_SECRET` - session signing secret
- `IP_HASH_SALT` - salt for hashed IP abuse checks
- `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD` - optional values used by local demo docs and seed defaults

## Notes

- Rate limiting is in memory, which is acceptable for the local and hackathon demo path but should move to Redis or another shared store for multi-instance production.
- Email notification plumbing is still scoped as a follow-up unless a real Resend key and verified sender domain are provided.
- The demo seed is idempotent for the seeded demo user and seeded form slugs; it does not delete unrelated local users or forms.
