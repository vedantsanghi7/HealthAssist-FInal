# src/data

Data access layer. Owns all Supabase client initialization and data-seeding utilities.

## Exports
- `supabase` — Browser-side Supabase client (`createBrowserClient`) for use in client components
- `supabaseAdmin` — Server-side Supabase client (service role key, bypasses RLS) for use in server actions and API routes only
- `addDummyRecords()` — Test data seeding function (in `seed/dummyData.ts`)
- `seedVitalsAction()` — Server action for seeding vital signs (in `actions/seedVitals.ts`)

## Depends on
- `src/shared` (for types)

## Rules
- Must **never** import from `src/auth`, `src/ai`, `src/components`, or `src/app`.
- `supabaseAdmin` must **never** be imported in client components — it contains the service role key.
- Future query helper functions should be added here (e.g., `src/data/queries/`).
