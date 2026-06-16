-- ============================================================
-- 012: Add notes column to vehicles table
-- ============================================================

alter table public.vehicles
    add column if not exists notes text;
