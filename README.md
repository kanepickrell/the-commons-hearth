# The Commons — Central Texas Catholic Land Movement

The chapter's digital commons: a bilingual (EN/ES) site where members find
neighbors by parish, RSVP to gatherings, and record the year's witness.
Live at https://www.centraltexasclm.org/.

## Stack

- Vite + React 18 + TypeScript, Tailwind, shadcn/ui primitives in `src/components/ui`
- Supabase (Postgres + Auth + Storage + Edge Functions) — project `ppzgdwjojztugeyqvbdi`
- react-leaflet / leaflet-draw for the parish map and admin area editor
- Deployed on Vercel (`vercel.json` rewrites everything to `index.html`)

## Local development

```sh
bun install
cp .env.example .env.local   # then paste the publishable key
bun run dev                  # http://localhost:8080
```

Checks:

```sh
bunx tsc -p tsconfig.app.json --noEmit   # types
bun run lint
bun run test
bun run build
```

## Layout

```
src/
  App.tsx              routes (bilingual slugs from i18n/routes.ts), providers, lazy pages
  auth/AuthProvider    one auth subscription + profile for the whole app (useAuth reads it)
  i18n/                LocaleProvider (EN/ES) and the route slug table
  lib/
    supabase.ts        client singleton (env vars above)
    database.types.ts  generated Postgres types — see "Regenerating types"
    crafts.ts          the craft_slug vocabulary + display labels
    dates.ts           locale tags, local "today", date formatting
    icons.ts           the eight illustrated crafts (SVGs in assets/icons)
    chester.ts         streaming client for the Chester chat function
  pages/               one file per route
  components/          shared UI; admin/ = Mayordomo panels; testimonio/ = Year Wheel;
                       chester/ = the chat widget mounted in Layout
supabase/
  config.toml          Edge Function settings (verify_jwt per function)
  functions/           Deno Edge Functions (email via Resend, admin member add, geocoding,
                       and `chester` — the chat guide)
  sql/                 one-off SQL to run in the dashboard, dated
```

## Data access model

- Anonymous visitors read through redacting views (`gatherings_public`,
  `witness_public`, `parish_member_counts`) plus a column-restricted subset of
  `profiles`. PostgREST rejects a whole SELECT if any requested column is
  denied, so client queries request restricted columns (`contact_email`,
  `custom_skills`) only when signed in.
- Members write through RLS-guarded inserts (`rsvps`, `workshops` at
  `status='pending'`, their own `profiles`/`expertise`).
- Admin actions go through SECURITY DEFINER RPCs (`approve_profile`,
  `admin_update_gathering`, `set_poc_status`, …) and the `admin-add-member`
  Edge Function. Browser-facing functions set `verify_jwt = false` so CORS
  preflight works, and check `profiles.is_admin` themselves.

## Regenerating types

`src/lib/database.types.ts` should be regenerated after any schema change:

```sh
supabase login
supabase gen types typescript --linked --schema public > src/lib/database.types.ts
```

On Windows use bash/WSL, or `| Out-File -Encoding utf8` — PowerShell's `>`
writes UTF-16, which ESLint can't parse. The file currently carries a few
hand-added relations (listed in its header) that the next regeneration will
replace.

## Deploying Edge Functions

```sh
supabase functions deploy member-notify
```

Secrets each function expects are listed at the top of its `index.ts`
(`RESEND_API_KEY`, `FROM_EMAIL`, `REPLY_TO`, `DISCORD_INVITE_URL`, …).

## Chester (chat guide)

`supabase/functions/chester` streams answers from Claude (`claude-opus-5`) about
the chapter, upcoming gatherings, distributism and Catholic Social Teaching.

- **Knowledge** lives in the `chester_knowledge` table and is edited in
  Mayordomo → Chester. Seed notes came from the site copy
  (`supabase/sql/2026-09-21_chester.sql`). The `leadership` note is a
  placeholder until a steward fills it in.
- **Gatherings** are read through `gatherings_public` with the anon key, so
  Chester sees exactly what a signed-out visitor sees — never a member-only
  address or time.
- **Log**: every exchange is written to `chester_messages` (visible in the
  panel) and drives the rate limits (40 messages/IP/hour, 1 500/day overall —
  constants at the top of `index.ts`).
- **Secrets**: `ANTHROPIC_API_KEY` (required — get one at
  console.anthropic.com), optional `CHESTER_IP_SALT`.

```sh
bunx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
bunx supabase functions deploy chester --use-api
```
