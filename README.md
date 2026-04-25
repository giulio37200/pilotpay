# PilotPay

PilotPay is a private-company per diem system for pilots, finance, and company administration.

## Current direction

This version now targets:

- frontend hosted as a static site
- authentication with Supabase
- database with Supabase Postgres
- one permanent `master` account
- internal `finance` and `pilot` accounts created by the master

## Main files

- app shell: [index.html](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/index.html)
- frontend logic: [app.js](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/app.js)
- visual styles: [styles.css](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/styles.css)
- Supabase config: [config.js](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/config.js)
- database setup: [supabase/schema.sql](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/supabase/schema.sql)
- master bootstrap function: [supabase/functions/bootstrap-master/index.ts](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/supabase/functions/bootstrap-master/index.ts)
- internal user creation function: [supabase/functions/create-company-user/index.ts](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/supabase/functions/create-company-user/index.ts)

## What the app already supports

- first access creates the definitive `master` account
- `master` can create `finance` and `pilot` accounts
- pilots only see their own data
- finance can manage pilots, per diem entries, and payments
- balances, history, trends, and CSV export

## What still needs your real Supabase project

To make the final version work online, this app still needs:

- your Supabase project URL
- your Supabase anon key
- the SQL from `supabase/schema.sql` applied in your project
- the two Edge Functions deployed in your Supabase project

After that, the static site can stay on GitHub Pages with no separate paid backend.