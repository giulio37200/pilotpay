# PilotPay Online Foundation

PilotPay now has the first layer needed to become a real private company system with controlled accounts.

## What changed

- backend now supports a first-run `master` account instead of demo logins
- real password hashing was added to the server foundation
- user roles now support `master`, `finance`, and `pilot`
- finance users can manage operational records
- pilot users remain restricted to their own data
- PostgreSQL schema was aligned with the new role model

## Product structure

### Master account

- full operational dashboard
- user management
- pilot management
- per diem entries
- payments
- audit visibility

### Finance account

- operational dashboard
- pilot management
- per diem entries
- payments
- no master-level user administration

### Pilot account

- access only to personal dashboard
- personal calendar
- own payment history
- own balance and trends

## Recommended rollout

1. Use first access to create the definitive master account.
2. Connect the current web interface to the backend foundation.
3. Replace local browser storage with database-backed records.
4. Let the master create finance and pilot users from inside the app.
5. Add hosted email reset and production deployment.
