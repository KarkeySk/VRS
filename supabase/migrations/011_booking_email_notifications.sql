-- ============================================================
-- 011: Booking approval email notification tracking
-- Tracks whether a booking confirmation email has been sent.
-- ============================================================

alter table public.bookings
    add column if not exists email_sent boolean not null default false;

create table if not exists public.email_logs (
    id          uuid primary key default gen_random_uuid(),
    booking_id  uuid references public.bookings(id) on delete cascade,
    sent_at     timestamptz not null default now(),
    status      text not null
);

alter table public.email_logs enable row level security;

create index if not exists idx_email_logs_booking_id
    on public.email_logs(booking_id);

drop policy if exists "Admins can view email logs" on public.email_logs;
create policy "Admins can view email logs"
    on public.email_logs for select
    to authenticated
    using (public.is_admin());

drop policy if exists "Admins can insert email logs" on public.email_logs;
create policy "Admins can insert email logs"
    on public.email_logs for insert
    to authenticated
    with check (public.is_admin());
