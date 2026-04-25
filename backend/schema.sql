create extension if not exists "pgcrypto";

create table app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('master', 'finance', 'pilot')),
  display_name text not null,
  pilot_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pilots (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  base_location text not null,
  preferred_currency text not null,
  last_per_diem_amount numeric(12,2),
  last_per_diem_currency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table app_users
  add constraint fk_app_users_pilot
  foreign key (pilot_id) references pilots(id) on delete set null;

create table per_diem_entries (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references pilots(id) on delete cascade,
  entry_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null,
  notes text,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pilot_id, entry_date)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references pilots(id) on delete cascade,
  payment_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null,
  notes text,
  recorded_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references app_users(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_per_diem_entries_pilot_date on per_diem_entries (pilot_id, entry_date desc);
create index idx_payments_pilot_date on payments (pilot_id, payment_date desc);
create index idx_audit_logs_created_at on audit_logs (created_at desc);
