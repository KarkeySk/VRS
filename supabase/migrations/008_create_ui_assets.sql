-- ============================================================
-- 008: UI image assets table
-- Stores image URLs previously hardcoded in frontend
-- ============================================================

create table if not exists public.ui_assets (
    id          uuid primary key default gen_random_uuid(),
    asset_key   text not null unique,
    image_url   text not null,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

alter table public.ui_assets enable row level security;

create trigger ui_assets_updated_at
    before update on public.ui_assets
    for each row
    execute function public.set_updated_at();

create policy "UI assets are viewable by everyone"
    on public.ui_assets for select
    using (true);

create policy "Admins can insert ui assets"
    on public.ui_assets for insert
    to authenticated
    with check (public.is_admin());

create policy "Admins can update ui assets"
    on public.ui_assets for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

create policy "Admins can delete ui assets"
    on public.ui_assets for delete
    to authenticated
    using (public.is_admin());
