# Grabbit 🐇

Community grocery clearance & deals for Greater Boston. Every yellow-sticker
markdown at the stores near you — pulled from store systems where possible,
spotted by fellow shoppers everywhere else. **See it, grab it.**

Mobile-first PWA · React + Vite + TypeScript + Tailwind · Supabase backend.

## Run it (demo mode — no backend needed)

```bash
npm install
npm run dev
```

With no env vars set, the app runs entirely on a bundled demo dataset
(65 real Boston-area store locations, 150 generated deals, 30 coupons,
10 demo users). Accounts, posts, votes, and points persist in
`localStorage`. This is the PRD's MVP seed dataset served behind the same
API contract as production — swapping in Supabase changes nothing in the UI.

## Go live with Supabase

1. Create a Supabase project, then apply the SQL in order:
   `supabase/migrations/0001_schema.sql` → `0002_rls.sql` → `0003_functions.sql`,
   then seed with `supabase/seed.sql`
   (or `supabase link && supabase db push && psql ... -f supabase/seed.sql`).
2. Deploy the expiry sweep: `supabase functions deploy expire-deals`, and
   schedule it hourly (cron snippet at the top of
   `supabase/functions/expire-deals/index.ts`).
3. Copy `.env.example` → `.env.local` and set `VITE_SUPABASE_URL` +
   `VITE_SUPABASE_ANON_KEY`. Enable the Email (magic link) auth provider.
4. `npm run build` and deploy `dist/` (Vercel: framework preset “Vite”).

## Architecture

```
src/lib/api.ts            one deal-read/write contract (PRD §7)
src/lib/api.demo.ts       demo adapter — bundled seed + localStorage
src/lib/api.supabase.ts   live adapter — RPCs enforce rate limits & points
src/data/                 chains, stores, deterministic demo dataset
src/screens/              Feed · Map · Post · Coupons · Profile (+ Auth, Onboarding)
supabase/migrations/      schema, RLS, SECURITY DEFINER business logic
supabase/seed.sql         demo data for a live project (regenerate:
                          node scripts/generate-seed-sql.mjs)
```

Future Walmart/Target ingestion writes `source='store_data'` rows into the
same `deals` table — nothing in the app changes when real feeds arrive.

## License

MIT
