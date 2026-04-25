# Supabase Setup

PilotPay now uses Supabase as the online backend.

## Apply database structure

Run the SQL in [schema.sql](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/supabase/schema.sql) inside the SQL editor of your Supabase project.

## Deploy Edge Functions

Deploy these functions in your Supabase project:

- [bootstrap-master/index.ts](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/supabase/functions/bootstrap-master/index.ts)
- [create-company-user/index.ts](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/supabase/functions/create-company-user/index.ts)

## Add frontend credentials

Fill [config.js](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/config.js) with:

- `supabaseUrl`
- `supabaseAnonKey`

## Result

Once those steps are done:

- GitHub Pages can continue serving the app
- Supabase handles authentication and data
- the first access creates the permanent `master` account
