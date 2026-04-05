-- ============================================================
-- 002: Vehicles table
-- Stores fleet inventory managed by admins
-- ============================================================

create table if not exists public.vehicles (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    subtitle        text,
    image           text,
    type            text not null default 'car' check (type in ('car', 'bike', 'jeep', 'suv', 'pickup')),
    engine          text,
    torque          text,
    drive           text,
    capacity        text,
    price_per_day   numeric(10,2) not null default 0,
    rating          numeric(2,1) default 0,
    category        text,
    is_available     boolean not null default true,
    capabilities    jsonb default '[]'::jsonb,
    technical_specs jsonb default '[]'::jsonb,
    altitude        jsonb default '{}'::jsonb,
    addons          jsonb default '[]'::jsonb,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

alter table public.vehicles enable row level security;

-- Auto-update updated_at
create trigger vehicles_updated_at
    before update on public.vehicles
    for each row
    execute function public.set_updated_at();
