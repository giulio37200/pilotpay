# PilotPay Backend Foundation

This folder now contains the private-company account model for PilotPay.

## Included

- `server.js`: starter API with first-run master setup, real password hashing, sessions, and role-based access
- `schema.sql`: PostgreSQL schema for production
- `data/store.json`: local JSON store created automatically on first run

## Run locally

```bash
node backend/server.js
```

The API starts on `http://localhost:8787`.

## How access works now

On a fresh install there are no demo users.

The first step is:

- create the company `master` account once through `POST /api/bootstrap/master`

After that:

- `master` can access everything
- `master` can create `finance` users
- `master` can create `pilot` users linked to pilot profiles
- `finance` can manage pilots, per diem entries, and payments
- `pilot` can only access personal data

## Main endpoints

- `GET /api/health`
- `POST /api/bootstrap/master`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/session`
- `GET /api/dashboard/summary`
- `GET /api/audit-logs`
- `GET /api/users`
- `POST /api/users`
- `GET /api/pilots`
- `POST /api/pilots`
- `GET /api/per-diems`
- `POST /api/per-diems`
- `GET /api/payments`
- `POST /api/payments`

## Current rollout model

This backend is now ready for the company-only structure:

- one definitive master login
- internal finance accounts
- pilot accounts created by the master
- no public self-signup

## Next production steps

- connect the web interface to these endpoints
- move JSON storage to PostgreSQL using `schema.sql`
- add email delivery for password reset
- add refresh tokens and tighter session rules
