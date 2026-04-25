# PilotPay

PilotPay is a private-company per diem management system for pilots, finance, and company administration.

## Current app

- master account first setup
- secure login flow
- finance and pilot roles
- pilot management
- per diem entries
- payment tracking
- outstanding balance overview
- CSV export
- audit trail

Open [index.html](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/index.html) in a browser for local validation.

## Deployment-ready base

- app server: [backend/server.js](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/backend/server.js)
- database schema: [backend/schema.sql](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/backend/schema.sql)
- backend guide: [backend/README.md](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/backend/README.md)
- rollout notes: [docs/online-foundation.md](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/docs/online-foundation.md)
- deployment manifest: [render.yaml](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/render.yaml)
- runtime config: [package.json](/Users/marchetti/Documents/Codex/2026-04-24/check-meu-projeto-pilotpay-no-github/package.json)

## Important note

The current online-ready backend still persists data in a local JSON store. That works for protected first deployment and internal validation, but the next production-grade step is moving records to PostgreSQL.