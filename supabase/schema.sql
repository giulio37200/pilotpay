create extension if not exists "pgcrypto";

create table if not exists public.pilots (
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

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role text not null check (role in ('master', 'finance', 'pilot')),
  pilot_id uuid references public.pilots(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.per_diem_entries (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.pilots(id) on delete cascade,
  entry_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pilot_id, entry_date)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.pilots(id) on delete cascade,
  payment_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null,
  notes text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_pilot_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select pilot_id from public.profiles where id = auth.uid();
$$;

create or replace function public.pilotpay_bootstrap_required()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (select 1 from public.profiles);
$$;

alter table public.profiles enable row level security;
alter table public.pilots enable row level security;
alter table public.per_diem_entries enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.current_role() = 'master'
);

drop policy if exists "pilots manager read" on public.pilots;
create policy "pilots manager read"
on public.pilots for select
to authenticated
using (
  public.current_role() in ('master', 'finance')
  or id = public.current_pilot_id()
);

drop policy if exists "pilots manager insert" on public.pilots;
create policy "pilots manager insert"
on public.pilots for insert
to authenticated
with check (public.current_role() in ('master', 'finance'));

drop policy if exists "pilots manager update" on public.pilots;
create policy "pilots manager update"
on public.pilots for update
to authenticated
using (public.current_role() in ('master', 'finance'))
with check (public.current_role() in ('master', 'finance'));

drop policy if exists "per diems read" on public.per_diem_entries;
create policy "per diems read"
on public.per_diem_entries for select
to authenticated
using (
  public.current_role() in ('master', 'finance')
  or pilot_id = public.current_pilot_id()
);

drop policy if exists "per diems insert" on public.per_diem_entries;
create policy "per diems insert"
on public.per_diem_entries for insert
to authenticated
with check (public.current_role() in ('master', 'finance'));

drop policy if exists "payments read" on public.payments;
create policy "payments read"
on public.payments for select
to authenticated
using (
  public.current_role() in ('master', 'finance')
  or pilot_id = public.current_pilot_id()
);

drop policy if exists "payments insert" on public.payments;
create policy "payments insert"
on public.payments for insert
to authenticated
with check (public.current_role() in ('master', 'finance'));

drop policy if exists "audit read" on public.audit_logs;
create policy "audit read"
on public.audit_logs for select
to authenticated
using (public.current_role() in ('master', 'finance'));

create or replace function public.handle_per_diem_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_user_id, entity_type, entity_id, action, detail)
  values (
    auth.uid(),
    'per_diem',
    new.id,
    'per_diem_created',
    jsonb_build_object('pilotId', new.pilot_id, 'date', new.entry_date)
  );
  return new;
end;
$$;

create or replace function public.handle_payment_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_user_id, entity_type, entity_id, action, detail)
  values (
    auth.uid(),
    'payment',
    new.id,
    'payment_created',
    jsonb_build_object('pilotId', new.pilot_id, 'date', new.payment_date)
  );
  return new;
end;
$$;

create or replace function public.handle_pilot_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_user_id, entity_type, entity_id, action, detail)
  values (
    auth.uid(),
    'pilot',
    new.id,
    'pilot_created',
    jsonb_build_object('email', new.email)
  );
  return new;
end;
$$;

drop trigger if exists trg_per_diem_audit on public.per_diem_entries;
create trigger trg_per_diem_audit
after insert on public.per_diem_entries
for each row execute function public.handle_per_diem_audit();

drop trigger if exists trg_payment_audit on public.payments;
create trigger trg_payment_audit
after insert on public.payments
for each row execute function public.handle_payment_audit();

drop trigger if exists trg_pilot_audit on public.pilots;
create trigger trg_pilot_audit
after insert on public.pilots
for each row execute function public.handle_pilot_audit();

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_per_diem_entries_pilot_date on public.per_diem_entries (pilot_id, entry_date desc);
create index if not exists idx_payments_pilot_date on public.payments (pilot_id, payment_date desc);
create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at desc);
