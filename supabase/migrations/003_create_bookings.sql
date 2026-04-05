-- ============================================================
-- 003: Bookings table
-- Links users to vehicles with date ranges
-- ============================================================

create table if not exists public.bookings (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references public.profiles(id) on delete cascade,
    vehicle_id      uuid not null references public.vehicles(id) on delete cascade,
    start_date      date not null,
    end_date        date not null,
    total_price     numeric(10,2) not null default 0,
    status          text not null default 'pending'
                        check (status in ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    addons          jsonb default '[]'::jsonb,
    notes           text,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),

    constraint valid_date_range check (end_date >= start_date)
);

alter table public.bookings enable row level security;

-- Indexes for common query patterns
create index idx_bookings_user_id    on public.bookings(user_id);
create index idx_bookings_vehicle_id on public.bookings(vehicle_id);
create index idx_bookings_status     on public.bookings(status);

-- Auto-update updated_at
create trigger bookings_updated_at
    before update on public.bookings
    for each row
    execute function public.set_updated_at();
